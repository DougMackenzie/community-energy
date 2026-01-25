declare module 'react-scrollama' {
    import { ReactNode } from 'react';

    export interface ScrollamaProps {
        offset?: number;
        threshold?: number;
        onStepEnter?: (response: StepResponse) => void;
        onStepExit?: (response: StepResponse) => void;
        onStepProgress?: (response: ProgressResponse) => void;
        debug?: boolean;
        children: ReactNode;
    }

    export interface StepResponse {
        element: HTMLElement;
        data: unknown;
        direction: 'up' | 'down';
        entry: IntersectionObserverEntry;
    }

    export interface ProgressResponse extends StepResponse {
        progress: number;
    }

    export interface StepProps {
        data?: unknown;
        children: ReactNode | ((props: { isActive: boolean }) => ReactNode);
    }

    export function Scrollama(props: ScrollamaProps): JSX.Element;
    export function Step(props: StepProps): JSX.Element;
}
