{
  description = "Felix Gurka - Cucumber World Website Development Environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs_20
            nodePackages.npm
            nodePackages.serve
            nodePackages.live-server
            nodePackages.http-server
            # Development tools
            direnv
            git
          ];

          shellHook = ''
            echo "🥒 Felix Gurka Development Environment 🥒"
            echo "=========================================="
            echo ""
            echo "Available commands:"
            echo "  npm run dev     - Live-reload development server"
            echo "  serve .         - Simple static server"
            echo "  live-server     - Live-reload server"
            echo "  http-server     - Basic HTTP server"
            echo ""
            echo "Quick start:"
            echo "  npm run dev     - Start development (recommended)"
            echo "  serve .         - Serve current directory"
            echo ""
            echo "Tools:"
            echo "  Node.js version: $(node --version)"
            echo "  NPM version: $(npm --version)"
            echo "  direnv: $(direnv --version 2>/dev/null || echo 'available')"
            echo ""
            echo "💡 Tip: Use 'direnv allow' to auto-enter this environment"
            echo "Ready to develop! 🚀"
          '';

          # Set environment variables
          NODE_ENV = "development";
        };

        # Optional: Define packages that can be built
        packages = {
          # Static site build (if needed in the future)
          website = pkgs.stdenv.mkDerivation {
            name = "felix-gurka-website";
            src = ./.;
            
            buildInputs = with pkgs; [ nodejs_20 ];
            
            buildPhase = ''
              # For now, just copy files since it's a static site
              echo "Building Felix Gurka website..."
            '';
            
            installPhase = ''
              mkdir -p $out
              cp -r * $out/
              echo "Website built successfully!"
            '';
          };
        };

        # Define apps for easy running
        apps = {
          serve = {
            type = "app";
            program = "${pkgs.nodePackages.serve}/bin/serve";
          };
          
          live-server = {
            type = "app";
            program = "${pkgs.nodePackages.live-server}/bin/live-server";
          };
          
          http-server = {
            type = "app";
            program = "${pkgs.nodePackages.http-server}/bin/http-server";
          };
        };
      });
}