import React from 'react';
import { render as rtlRender, RenderOptions } from '@testing-library/react';
import { SWRConfig } from 'swr';

/**
 * Custom render function that wraps components with necessary providers
 */

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
    // Add custom options here if needed
    swrConfig?: any;
}

function customRender(
    ui: React.ReactElement,
    options?: CustomRenderOptions
) {
    const { swrConfig, ...renderOptions } = options || {};

    function Wrapper({ children }: { children: React.ReactNode }) {
        return (
            <SWRConfig
                value={{
                    dedupingInterval: 0,
                    provider: () => new Map(),
                    ...swrConfig,
                }}
            >
                {children}
            </SWRConfig>
        );
    }

    return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}

// Re-export everything
export * from '@testing-library/react';

// Override render method
export { customRender as render };
