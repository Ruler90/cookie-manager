export const deleteDevCookies = () => {
    const removeBtns: NodeListOf<HTMLButtonElement> = document.querySelectorAll('.mw-cm-item__btn--remove');
    removeBtns.forEach((item) => item.click());
};

// Remove btn icon
export const removeBtn = `
    <svg
        class="mw-cm__header-remove-btn-img"
        width="28"
        height="35"
        viewBox="0 0 28 35"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="M5 13V31C5 32.6569 6.34315 34 8 34H22C23.6569 34 25 32.6569 25 31V13"
            stroke="black"
            stroke-width="2"
            stroke-linejoin="round"
        />
        <path d="M12 19V28" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M18 19V28" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        <path
            class="mw-cm__header-remove-btn-img-cover"
            d="M3 12H27"
            stroke="black"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
        />
        <path
            class="mw-cm__header-remove-btn-img-cover-handle"
            d="M9.5 11V9.5C9.5 7.84315 10.8431 6.5 12.5 6.5H17.5C19.1569 6.5 20.5 7.84315 20.5 9.5V11"
            stroke="black"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
        />
    </svg>
`;
