const popup = (title, body, buttons = [], inputs = [], disappearsAfterMs) => new Promise((resolve, reject) => {
    const popupEl = document.createElement('div');
    popupEl.classList.add('popup');
    popupEl.innerHTML = /* html */ `
		<a class="popup-close-button">✕</a>
		<h1 class="popup-title">${title}</h1>
		<p class="popup-body">${body}</p>
	`;
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
        inputEl.type = input.type;
        inputEl.placeholder = input.placeholder;
        // Todo: fix this bug: the value is not shown
        if (input.value != undefined) {
            inputEl.value = input.value;
        }
        inputEl.setAttribute('data-name', input.name);
        // Create random ID in order to find the dynamically added element later on
        const randomId = randomString(10);
        inputEl.setAttribute('data-id', randomId);
        popupEl.appendChild(inputEl);
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
        buttonEl.addEventListener('click', () => {
            const inputResults = getInputValues();
            removePopup();
            resolve({
                buttonName: button.name,
                inputs: inputResults
            });
        });
        popupEl.appendChild(buttonEl);
    }
    // Add popup to the page
    document.body.appendChild(popupEl);
    // Close popup when x button or escape is pressed
    popupEl.querySelector('a.popup-close-button').addEventListener('click', () => {
        removePopup();
        reject();
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
            reject();
        }, disappearsAfterMs);
    }
});
const notification = (title, body, disappearsAfterMs = 3000) => new Promise((resolve) => {
    popup(title, body, [], [], disappearsAfterMs)
        // Buttonless popup can only reject
        .catch(resolve);
});
