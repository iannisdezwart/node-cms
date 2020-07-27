const popup = (title, body, buttons = [], inputs = [], disappearsAfterMs) => new Promise(resolve => {
    const popupEl = document.createElement('div');
    popupEl.classList.add('popup');
    popupEl.innerHTML = /* html */ `
		<a class="popup-close-button">✕</a>
		<h1 class="popup-title">${title}</h1>
		<p class="popup-body">${body}</p>
	`;
    // Add popup to the page
    document.body.appendChild(popupEl);
    const getInputValues = () => {
        const inputResults = new Map();
        for (let input of inputs) {
            const { value } = $(`input[data-name="${input.name}"]`);
            inputResults.set(input.name, value);
        }
        return inputResults;
    };
    const removePopup = () => {
        popupEl.classList.add('closed');
        setTimeout(() => {
            popupEl.remove();
        }, 300);
    };
    const submitPopup = (buttonName) => {
        const inputResults = getInputValues();
        removePopup();
        resolve({
            buttonName,
            inputs: inputResults
        });
    };
    for (let input of inputs) {
        const inputEl = document.createElement('input');
        // Add it to the popup
        popupEl.appendChild(inputEl);
        inputEl.type = input.type;
        if (input.placeholder != undefined) {
            inputEl.placeholder = input.placeholder;
        }
        inputEl.setAttribute('data-name', input.name);
        // Create random ID in order to find the dynamically added element later on
        const randomId = randomString(10);
        inputEl.setAttribute('data-id', randomId);
        // Todo: fix this bug: the value is not shown
        if (input.value != undefined) {
            // html value="X" will set the default value, js el.value does not work
            inputEl.setAttribute('value', input.value);
        }
        popupEl.innerHTML += /* html */ `
			<br><br>
		`;
        if (input.enterTriggersButton != undefined) {
            if (buttons.map(button => button.name).includes(input.enterTriggersButton)) {
                addEventListener('keyup', e => {
                    const target = e.target;
                    if (target.getAttribute('data-id') == randomId) {
                        if (e.key == 'Enter') {
                            submitPopup(input.enterTriggersButton);
                        }
                    }
                });
            }
        }
    }
    for (let button of buttons) {
        const buttonEl = document.createElement('button');
        buttonEl.innerHTML = button.name;
        if (button.classes != undefined) {
            for (let className of button.classes) {
                buttonEl.classList.add(className);
            }
        }
        buttonEl.classList.add('small');
        if (button.on != undefined) {
            for (let event in button.on) {
                const f = button.on[event];
                buttonEl.addEventListener(event, f);
            }
        }
        // Resolve on click
        if (button.resolvesPopup != false) {
            buttonEl.addEventListener('click', () => {
                const inputResults = getInputValues();
                removePopup();
                resolve({
                    buttonName: button.name,
                    inputs: inputResults
                });
            });
        }
        popupEl.appendChild(buttonEl);
    }
    // Close popup when x button or escape is pressed
    popupEl.querySelector('a.popup-close-button').addEventListener('click', () => {
        removePopup();
    });
    const escapePressHandler = (e) => {
        if (e.key == 'Escape') {
            removePopup();
            removeEventListener('keyup', escapePressHandler);
        }
    };
    addEventListener('keyup', escapePressHandler);
    if (disappearsAfterMs != undefined) {
        setTimeout(() => {
            removePopup();
        }, disappearsAfterMs);
    }
});
const notification = (title, body, disappearsAfterMs = 3000) => {
    popup(title, body, [], [], disappearsAfterMs);
};
class ProgressBar {
    constructor(startingRatio = 0) {
        // Create progress bar element
        this.el = document.createElement('div');
        this.el.classList.add('progress-bar');
        // Create inner
        this.inner = document.createElement('div');
        this.inner.classList.add('inner');
        this.inner.style.width = `${startingRatio * 100}%`;
        // Add to body
        this.el.appendChild(this.inner);
        document.body.appendChild(this.el);
    }
    set(newRatio) {
        this.inner.style.width = `${newRatio * 100}%`;
    }
    remove() {
        this.el.remove();
    }
}
