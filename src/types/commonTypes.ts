import { ReactElement, ReactNode, RefObject } from "react";
import { NextPage } from "next";


export type defaultFnType = () => void;
export declare type MapAny = Record<string, any>;
export const defaultFn = (): void => { };
export declare type EventCallbackType = (id: string, payload: MapAny) => void;

export interface CommonPageLayoutProps {
    scrollToTop?: defaultFnType;
    scrollToBottom?: defaultFnType;
    rootContainerRef?: RefObject<HTMLDivElement>;
}

export type NextPageWithLayout<P = object, IP = P> = NextPage<P, IP> & {
    getLayout?: (page: ReactElement) => ReactNode;
};



