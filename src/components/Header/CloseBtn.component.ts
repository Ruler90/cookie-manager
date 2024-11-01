export const closeCookieManager = () => {
    const overlay = document.querySelector('.mw-cookie-manager-overlay');
    overlay?.remove();
    const cookieManager = document.querySelector('.mw-cookie-manager');
    cookieManager?.remove();
};

// Close btn icon
export const closeBtn = `
    <svg class="mw-cm__header-close-btn-img" width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clip-path="url(#clip0_1201_6)">
            <path
                d="M27.9808 2.01923L2.01929 27.9808"
                stroke="black"
                stroke-width="4"
                stroke-linecap="round"
                stroke-linejoin="round"
            />
            <path
                d="M2.01929 2.01923L27.9808 27.9808"
                stroke="black"
                stroke-width="4"
                stroke-linecap="round"
                stroke-linejoin="round"
            />
        </g>
        <defs>
            <clipPath id="clip0_1201_6">
                <rect width="30" height="30" fill="white" />
            </clipPath>
        </defs>
    </svg>
`;
