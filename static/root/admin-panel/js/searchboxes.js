const blurSearchBox = (sb) => {
    sb.querySelector('input').blur();
    sb.querySelector('ul.dropdown').classList.remove('visible');
    sb.querySelector('.arrow').classList.remove('down');
};
const initSearchBoxes = () => {
    let searchBoxes = $a('.search');
    for (let sb of searchBoxes) {
        // Dropdown
        // On focus, add the arrow and show the dropdown
        sb.querySelector('input').onfocus = () => {
            sb.querySelector('ul.dropdown').classList.add('visible');
            sb.querySelector('.arrow').classList.add('down');
        };
        // On blur, remove the arrow and hide the dropdown
        sb.querySelector('input').onblur = () => blurSearchBox(sb);
        // Make sure that clicking the arrow does not blur the search box
        let unfocussableElements = sb.$a('.arrow');
        for (let unfocussable of unfocussableElements) {
            unfocussable.addEventListener('mouseover', () => {
                sb.querySelector('input').onblur = null;
            });
            unfocussable.addEventListener('mouseleave', () => {
                sb.querySelector('input').onblur = () => blurSearchBox(sb);
            });
        }
        // Show or hide the search box when the arrow is clicked
        sb.querySelector('.arrow').addEventListener('click', () => {
            if (sb.querySelector('ul.dropdown').classList.contains('visible')) {
                blurSearchBox(sb);
            }
            else {
                sb.querySelector('input').focus();
            }
        });
        // Clicking LIs
        const searchBoxLIs = sb.$a('ul.dropdown > li');
        // Set the value of the input element to the clicked LI
        for (let li of searchBoxLIs) {
            li.addEventListener('click', () => {
                sb.$('input').value = li.innerText;
            });
        }
        // Search
        // When user is typing in the input, search for the input and show it in the dropdown
        if (!sb.classList.contains('no-input-filter')) {
            sb.querySelector('input').oninput = () => {
                let value = sb.querySelector('input').value.toLowerCase();
                unselectLi(searchBoxLIs);
                for (let li of searchBoxLIs) {
                    if (!li.innerText.toLowerCase().includes(value)) {
                        li.style.display = 'none';
                    }
                    else {
                        li.style.display = 'block';
                    }
                }
            };
        }
        // Handle key input
        let selectedIndex = -1;
        // Visually select LI
        const selectLi = (lis, index) => {
            if (selectedIndex != -1) {
                lis[selectedIndex].classList.remove('selected');
            }
            selectedIndex = index;
            lis[selectedIndex].classList.add('selected');
            let dropdown = $('.dropdown');
            let selectedEl = $('li.selected');
            if ((dropdown.offsetHeight - selectedEl.offsetHeight) - (selectedEl.offsetTop - dropdown.scrollTop) < 0) {
                // Scroll down to the element
                dropdown.scrollTop = selectedEl.offsetTop + selectedEl.offsetHeight - dropdown.offsetHeight;
            }
            else if ((selectedEl.offsetTop - dropdown.scrollTop) < 0) {
                // Scroll up to the element
                dropdown.scrollTop = selectedEl.offsetTop;
            }
        };
        // Visually unselect LI
        const unselectLi = (lis) => {
            if (selectedIndex != -1) {
                lis[selectedIndex].classList.remove('selected');
            }
            selectedIndex = -1;
        };
        // Handle typed input
        sb.querySelector('input').addEventListener('keydown', e => {
            // On Enter, click LI
            if (e.code == 'Enter') {
                if (selectedIndex == -1) {
                    // Click first LI
                    for (let li of searchBoxLIs) {
                        if (li.style.display != 'none') {
                            li.click();
                            blurSearchBox(sb);
                            unselectLi(searchBoxLIs);
                            break;
                        }
                    }
                }
                else {
                    // Click current active LI
                    searchBoxLIs[selectedIndex].click();
                    blurSearchBox(sb);
                    unselectLi(searchBoxLIs);
                }
            }
            // On ArrowDown, move active index down
            if (e.code == 'ArrowDown') {
                e.preventDefault();
                if (selectedIndex == -1) {
                    // Select first LI
                    for (let i = 0; i < searchBoxLIs.length; i++) {
                        const li = searchBoxLIs[i];
                        if (li.style.display != 'none') {
                            selectLi(searchBoxLIs, i);
                            break;
                        }
                    }
                }
                else {
                    // Select next LI
                    for (let i = selectedIndex + 1; i < searchBoxLIs.length; i++) {
                        const li = searchBoxLIs[i];
                        if (li.style.display != 'none') {
                            selectLi(searchBoxLIs, i);
                            break;
                        }
                    }
                }
            }
            // On ArrowUp, move active index up
            if (e.code == 'ArrowUp') {
                e.preventDefault();
                if (selectedIndex == -1) {
                    // Select last LI
                    for (let i = searchBoxLIs.length - 1; i >= 0; i--) {
                        const li = searchBoxLIs[i];
                        if (li.style.display != 'none') {
                            selectLi(searchBoxLIs, i);
                            break;
                        }
                    }
                }
                else {
                    // Select previous LI
                    for (let i = selectedIndex - 1; i >= 0; i--) {
                        const li = searchBoxLIs[i];
                        if (li.style.display != 'none') {
                            selectLi(searchBoxLIs, i);
                            break;
                        }
                    }
                }
            }
        });
    }
};
addEventListener('load', initSearchBoxes);
