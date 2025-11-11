declare module '*.module.css' {
    const styles: Record<string, string>;
    export default styles;
}

declare module '*.module.css?raw' {
    const styles: string;
    export default styles;
}
