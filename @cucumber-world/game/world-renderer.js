/**
 * Enhanced World Renderer - Handles rendering of paths, environment objects, and visual effects
 * Part of Cucumber World RPG Enhanced System
 */

class WorldRenderer {
    constructor() {
        // Rendering layers (bottom to top)
        this.layers = {
            BACKGROUND: 0,
            PATHS: 1,
            ENVIRONMENT_BACK: 2,
            PLAYER: 3,
            ENVIRONMENT_FRONT: 4,
            EFFECTS: 5,
            UI: 6
        };
        
        // Loaded assets
        this.environmentObjects = null;
        this.pathDefinitions = null;
        
        // Animation state
        this.animationTime = 0;
        this.particleSystems = new Map();
        
        // Rendering cache
        this.pathCache = new Map();
        this.objectCache = new Map();
        
        this.init();
    }

    /**
     * Initialize the renderer
     */
    async init() {
        try {
            // Load object definitions
            await this.loadAssetDefinitions();
            console.log('World renderer initialized');
        } catch (error) {
            console.error('Failed to initialize world renderer:', error);
        }
    }

    /**
     * Load asset definition files
     */
    async loadAssetDefinitions() {
        try {
            // Load environment objects
            const envResponse = await fetch('@cucumber-world/objects/environment.json');
            this.environmentObjects = await envResponse.json();
            
            // Load path definitions
            const pathResponse = await fetch('@cucumber-world/objects/paths.json');
            this.pathDefinitions = await pathResponse.json();
            
            console.log('Asset definitions loaded');
        } catch (error) {
            console.error('Failed to load asset definitions:', error);
            // Use fallback definitions
            this.setupFallbackDefinitions();
        }
    }

    /**
     * Setup fallback definitions if loading fails
     */
    setupFallbackDefinitions() {
        this.environmentObjects = {
            object_types: {
                bushes: {
                    berry_bush: { emoji: '🫐', size: { width: 40, height: 35 } }
                },
                rocks: {
                    boulder: { emoji: '⛰️', size: { width: 60, height: 50 } }
                }
            }
        };
        
        this.pathDefinitions = {
            path_types: {
                dirt_path: { color: '#8B7355', border_color: '#6B5B3A', width_default: 40 }
            }
        };
    }

    /**
     * Render a complete level
     */
    renderLevel(ctx, levelData, playerPos, animationTime) {
        this.animationTime = animationTime;
        
        // Clear canvas
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        // Render background
        this.renderBackground(ctx, levelData);
        
        // Render paths
        this.renderPaths(ctx, levelData.paths || []);
        
        // Render environment objects (back layer)
        this.renderEnvironmentObjects(ctx, levelData.environment || [], 'back');
        
        // Render exits and indicators
        this.renderExits(ctx, levelData.exits || []);
        
        // Player will be rendered by the world explorer
        
        // Render environment objects (front layer)
        this.renderEnvironmentObjects(ctx, levelData.environment || [], 'front');
        
        // Render ambient effects
        this.renderAmbientEffects(ctx, levelData.ambient_effects || []);
        
        // Update particle systems
        this.updateParticleSystems(ctx);
    }

    /**
     * Render level background
     */
    renderBackground(ctx, levelData) {
        const bg = levelData.background || {};
        
        if (bg.type === 'gradient') {
            const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
            const colors = bg.colors || ['#90EE90', '#98FB98'];
            
            colors.forEach((color, index) => {
                gradient.addColorStop(index / (colors.length - 1), color);
            });
            
            ctx.fillStyle = gradient;
        } else {
            ctx.fillStyle = bg.color || '#90EE90';
        }
        
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }

    /**
     * Render all paths in the level
     */
    renderPaths(ctx, paths) {
        paths.forEach(path => this.renderPath(ctx, path));
    }

    /**
     * Render a single path
     */
    renderPath(ctx, pathData) {
        const pathType = this.pathDefinitions.path_types[pathData.type];
        if (!pathType) {
            console.warn('Unknown path type:', pathData.type);
            return;
        }

        const points = pathData.points;
        if (!points || points.length < 2) return;

        const width = pathData.width || pathType.width_default;
        const style = pathData.style || 'straight';

        ctx.save();

        // Draw path background
        ctx.strokeStyle = pathType.color;
        ctx.lineWidth = width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        this.drawPathLine(ctx, points, style);

        // Draw path border
        ctx.strokeStyle = pathType.border_color;
        ctx.lineWidth = width + 4;
        ctx.globalCompositeOperation = 'destination-over';
        
        this.drawPathLine(ctx, points, style);

        ctx.restore();

        // Render path decorations
        this.renderPathDecorations(ctx, pathData, points);
    }

    /**
     * Draw the actual path line based on style
     */
    drawPathLine(ctx, points, style) {
        ctx.beginPath();
        ctx.moveTo(points[0][0], points[0][1]);

        if (style === 'straight') {
            for (let i = 1; i < points.length; i++) {
                ctx.lineTo(points[i][0], points[i][1]);
            }
        } else if (style === 'curved') {
            this.drawCurvedPath(ctx, points);
        } else if (style === 'winding') {
            this.drawWindingPath(ctx, points);
        }

        ctx.stroke();
    }

    /**
     * Draw a curved path using quadratic curves
     */
    drawCurvedPath(ctx, points) {
        for (let i = 1; i < points.length; i++) {
            const prev = points[i - 1];
            const curr = points[i];
            
            if (i === points.length - 1) {
                ctx.lineTo(curr[0], curr[1]);
            } else {
                const next = points[i + 1];
                const cpX = curr[0];
                const cpY = curr[1];
                const endX = (curr[0] + next[0]) / 2;
                const endY = (curr[1] + next[1]) / 2;
                
                ctx.quadraticCurveTo(cpX, cpY, endX, endY);
            }
        }
    }

    /**
     * Draw a winding path with more curves
     */
    drawWindingPath(ctx, points) {
        for (let i = 1; i < points.length; i++) {
            const prev = points[i - 1];
            const curr = points[i];
            
            // Add some randomness to create winding effect
            const offset = Math.sin(i * 0.5) * 20;
            const midX = (prev[0] + curr[0]) / 2 + offset;
            const midY = (prev[1] + curr[1]) / 2;
            
            ctx.quadraticCurveTo(midX, midY, curr[0], curr[1]);
        }
    }

    /**
     * Render path decorations
     */
    renderPathDecorations(ctx, pathData, points) {
        const decorations = pathData.decorations || [];
        
        decorations.forEach(decorationType => {
            const decoration = this.pathDefinitions.path_decorations[decorationType];
            if (!decoration) return;

            this.placeDecorationsAlongPath(ctx, points, decoration);
        });
    }

    /**
     * Place decorations along a path
     */
    placeDecorationsAlongPath(ctx, points, decoration) {
        const spacing = decoration.spacing || 50;
        let distance = 0;
        let nextDecorationDistance = spacing / 2; // Start halfway

        for (let i = 1; i < points.length; i++) {
            const prev = points[i - 1];
            const curr = points[i];
            const segmentLength = Math.sqrt(
                Math.pow(curr[0] - prev[0], 2) + Math.pow(curr[1] - prev[1], 2)
            );

            while (distance + segmentLength >= nextDecorationDistance) {
                const t = (nextDecorationDistance - distance) / segmentLength;
                const x = prev[0] + (curr[0] - prev[0]) * t;
                const y = prev[1] + (curr[1] - prev[1]) * t;

                // Add offset for side decorations
                const offset = decoration.offset || 0;
                const offsetX = offset * Math.cos(this.animationTime / 1000);
                const offsetY = offset * Math.sin(this.animationTime / 1000);

                ctx.save();
                ctx.font = `${decoration.size || 16}px Arial`;
                ctx.textAlign = 'center';
                
                if (decoration.glow) {
                    ctx.shadowColor = '#FFD700';
                    ctx.shadowBlur = 10;
                }
                
                ctx.fillText(decoration.emoji, x + offsetX, y + offsetY);
                ctx.restore();

                nextDecorationDistance += spacing;
            }

            distance += segmentLength;
        }
    }

    /**
     * Render environment objects
     */
    renderEnvironmentObjects(ctx, objects, layer) {
        objects.forEach(obj => {
            const objDef = this.getObjectDefinition(obj.type);
            if (!objDef) return;

            // Determine render layer
            const renderInFront = this.shouldRenderInFront(obj.type);
            if ((layer === 'front' && !renderInFront) || (layer === 'back' && renderInFront)) {
                return;
            }

            this.renderEnvironmentObject(ctx, obj, objDef);
        });
    }

    /**
     * Get object definition from loaded assets
     */
    getObjectDefinition(type) {
        const categories = this.environmentObjects.object_types;
        
        for (const category of Object.values(categories)) {
            if (category[type]) {
                return category[type];
            }
        }
        
        return null;
    }

    /**
     * Determine if object should render in front of player
     */
    shouldRenderInFront(type) {
        // Trees and tall objects render in front
        return type.includes('tree') || type.includes('boulder');
    }

    /**
     * Render a single environment object
     */
    renderEnvironmentObject(ctx, obj, objDef) {
        const [x, y] = obj.position;
        const size = objDef.size || { width: 30, height: 30 };

        ctx.save();

        // Apply animations
        if (objDef.animations) {
            this.applyObjectAnimations(ctx, obj, objDef, x, y);
        }

        // Render shadow if object casts one
        if (objDef.shadow) {
            this.renderObjectShadow(ctx, x, y, size);
        }

        // Render the object
        ctx.font = `${Math.max(size.width, size.height)}px Arial`;
        ctx.textAlign = 'center';
        
        // Apply glow effect for magical objects
        if (objDef.glow || obj.magical) {
            ctx.shadowColor = '#FFD700';
            ctx.shadowBlur = 15;
        }

        ctx.fillText(objDef.emoji, x, y);

        // Render interaction indicator
        if (objDef.interactive && this.isNearPlayer(x, y)) {
            this.renderInteractionIndicator(ctx, x, y - size.height);
        }

        ctx.restore();
    }

    /**
     * Apply object animations
     */
    applyObjectAnimations(ctx, obj, objDef, x, y) {
        objDef.animations.forEach(animationType => {
            const animDef = this.environmentObjects.animation_effects[animationType];
            if (!animDef) return;

            switch (animDef.type) {
                case 'rotation':
                    const angle = Math.sin(this.animationTime / 1000 * animDef.frequency) * 
                                 (animDef.amplitude * Math.PI / 180);
                    ctx.translate(x, y);
                    ctx.rotate(angle);
                    ctx.translate(-x, -y);
                    break;
                    
                case 'shake':
                    if (obj.isShaking) {
                        const shakeX = (Math.random() - 0.5) * animDef.amplitude;
                        const shakeY = (Math.random() - 0.5) * animDef.amplitude;
                        ctx.translate(shakeX, shakeY);
                    }
                    break;
            }
        });
    }

    /**
     * Render object shadow
     */
    renderObjectShadow(ctx, x, y, size) {
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.ellipse(x, y + size.height / 2, size.width / 3, size.height / 6, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();
    }

    /**
     * Check if position is near player (placeholder - would need player position)
     */
    isNearPlayer(x, y) {
        // This would need actual player position passed in
        return false;
    }

    /**
     * Render interaction indicator
     */
    renderInteractionIndicator(ctx, x, y) {
        ctx.save();
        
        // Floating indicator with pulse animation
        const pulse = Math.sin(this.animationTime / 300) * 0.3 + 0.7;
        const floatY = y + Math.sin(this.animationTime / 500) * 3;
        
        ctx.globalAlpha = pulse;
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('💬', x, floatY);
        
        ctx.restore();
    }

    /**
     * Render level exits and transition indicators
     */
    renderExits(ctx, exits) {
        exits.forEach(exit => {
            if (exit.hidden && !exit.discovered) return;
            
            const [x, y] = exit.position;
            const indicator = this.pathDefinitions.path_indicators[exit.visual_indicator];
            
            if (indicator) {
                ctx.save();
                
                // Apply indicator animation
                this.applyIndicatorAnimation(ctx, indicator, x, y);
                
                ctx.font = `${indicator.size || 24}px Arial`;
                ctx.textAlign = 'center';
                
                if (indicator.glow) {
                    ctx.shadowColor = '#00FFFF';
                    ctx.shadowBlur = 20;
                }
                
                ctx.fillText(indicator.emoji, x, y);
                ctx.restore();
            }
            
            // Render exit name when near
            if (this.isNearPlayer(x, y)) {
                ctx.save();
                ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
                ctx.fillRect(x - 60, y - 40, 120, 25);
                
                ctx.fillStyle = 'white';
                ctx.font = '14px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(exit.name, x, y - 20);
                ctx.restore();
            }
        });
    }

    /**
     * Apply indicator animations
     */
    applyIndicatorAnimation(ctx, indicator, x, y) {
        switch (indicator.animation) {
            case 'pulse':
                const scale = 0.8 + Math.sin(this.animationTime / 400) * 0.2;
                ctx.translate(x, y);
                ctx.scale(scale, scale);
                ctx.translate(-x, -y);
                break;
                
            case 'float':
                const floatOffset = Math.sin(this.animationTime / 600) * 5;
                ctx.translate(0, floatOffset);
                break;
                
            case 'twinkle':
                const alpha = 0.5 + Math.sin(this.animationTime / 200) * 0.5;
                ctx.globalAlpha = alpha;
                break;
        }
    }

    /**
     * Render ambient effects
     */
    renderAmbientEffects(ctx, effects) {
        effects.forEach(effect => {
            switch (effect.type) {
                case 'particle_system':
                    this.renderParticleSystem(ctx, effect);
                    break;
                    
                case 'wind_effect':
                    this.renderWindEffect(ctx, effect);
                    break;
            }
        });
    }

    /**
     * Render particle systems
     */
    renderParticleSystem(ctx, effect) {
        let system = this.particleSystems.get(effect.effect);
        
        if (!system) {
            system = this.createParticleSystem(effect);
            this.particleSystems.set(effect.effect, system);
        }
        
        // Update and render particles
        system.particles.forEach(particle => {
            this.updateParticle(particle);
            this.renderParticle(ctx, particle);
        });
        
        // Add new particles
        if (Math.random() < effect.density) {
            system.particles.push(this.createParticle(effect));
        }
        
        // Remove dead particles
        system.particles = system.particles.filter(p => p.life > 0);
    }

    /**
     * Create a new particle system
     */
    createParticleSystem(effect) {
        return {
            type: effect.effect,
            particles: [],
            maxParticles: 50
        };
    }

    /**
     * Create a new particle
     */
    createParticle(effect) {
        return {
            x: Math.random() * 1200,
            y: Math.random() * 800,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            life: 1.0,
            decay: 0.001,
            size: Math.random() * 10 + 5,
            emoji: this.getParticleEmoji(effect.effect)
        };
    }

    /**
     * Get appropriate emoji for particle type
     */
    getParticleEmoji(type) {
        const particleEmojis = {
            pollen_drift: '✨',
            leaf_fall: '🍃',
            snow: '❄️',
            rain: '💧'
        };
        
        return particleEmojis[type] || '✨';
    }

    /**
     * Update particle position and life
     */
    updateParticle(particle) {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life -= particle.decay;
        
        // Wrap around screen
        if (particle.x < 0) particle.x = 1200;
        if (particle.x > 1200) particle.x = 0;
        if (particle.y < 0) particle.y = 800;
        if (particle.y > 800) particle.y = 0;
    }

    /**
     * Render a particle
     */
    renderParticle(ctx, particle) {
        ctx.save();
        ctx.globalAlpha = particle.life;
        ctx.font = `${particle.size}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(particle.emoji, particle.x, particle.y);
        ctx.restore();
    }

    /**
     * Update all particle systems
     */
    updateParticleSystems(ctx) {
        // This method is called each frame to update animations
        // The actual rendering is done in renderParticleSystem
    }

    /**
     * Render wind effects
     */
    renderWindEffect(ctx, effect) {
        // This would create swaying effects on objects
        // Currently handled in applyObjectAnimations
    }

    /**
     * Get cached path data
     */
    getCachedPath(pathId) {
        return this.pathCache.get(pathId);
    }

    /**
     * Cache path data for performance
     */
    cachePath(pathId, pathData) {
        this.pathCache.set(pathId, pathData);
    }

    /**
     * Clear all caches
     */
    clearCache() {
        this.pathCache.clear();
        this.objectCache.clear();
        this.particleSystems.clear();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WorldRenderer;
} else if (typeof window !== 'undefined') {
    window.WorldRenderer = WorldRenderer;
}