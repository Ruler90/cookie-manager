declare module '*.module.css' {
    const styles: Record<string, string>;
    export default styles;
}

declare module '*.module.css?raw' {
    const styles: string;
    export default styles;
}

declare module '*.module.scss?raw' {
    const styles: string;
    export default styles;
}

declare module '*.module.scss?inline' {
    const styles: string;
    export default styles;
}

declare module '*.scss?inline' {
    const styles: string;
    export default styles;
}
