/// <reference types="vite/client" />

interface Window {
    desktop?: {
        app: {
            platform: string;
            versions: NodeJS.ProcessVersions;
        };
    };
}
