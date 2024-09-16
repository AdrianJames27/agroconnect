// Class Dialog
class Dialog {
    /**
     * State of the Input Dialog OK (1)
     */
    static OK_OPTION = 1;
    /**
     * State of the Input Dialog CANCEL (0)
     */
    static CANCEL_OPTION = 0;

    /**
     * method of Dialog Class that allows user input
     * @param {innerText} textTitle Title of the dialog (only plain text)
     * @param {innerHTML} textMessage Message of the dialog for user input (allows element tags)
     * @returns data of dialog upon resolve().
     */
    static async confirmDialog(textTitle, textMessage) {
        // create elemeents
        const inputDialog = document.createElement('dialog');
        const title = document.createElement('h4');
        const message = document.createElement('div');
        const divButtons = document.createElement('div');
        const btnOk = document.createElement('button');
        const btnCancel = document.createElement('button');
        // add attributes
        inputDialog.setAttribute('id', 'inputDialog');
        title.setAttribute('id', 'title');
        message.setAttribute('id', 'message');
        divButtons.setAttribute('id', 'divButtons');
        btnOk.setAttribute('id', 'btnOk');
        btnOk.innerText = 'OK';
        btnCancel.setAttribute('id', 'btnCancel');
        btnCancel.innerText = 'Cancel';

        // append the elements
        divButtons.append(btnOk, btnCancel);
        inputDialog.append(title, message, divButtons);
        $('body').prepend(inputDialog);

        /**
         * dialogData       =   contains the data of the input dialog
         * 
         * output           =   output of the dialog (input). null is default value
         * outputLength     =   length of the output
         * operation        =   operations of the buttons in dialog. 0 is default value
         *                      1 - OK
         *                      0 - CANCEL
         */
        const dialogData = {
            operation: 0,
        };

        return new Promise((resolve) => {
            if (!inputDialog.open) {
                // Display the modal with the message
                inputDialog.showModal();

                // show the message
                title.innerText = textTitle;
                message.innerHTML = textMessage;
                btnOk.addEventListener('click', () => {
                    // close the dialog
                    inputDialog.close();

                    // remove the element                                       
                    $(inputDialog).remove();

                    dialogData.operation = 1;

                    // Resolve the promise to indicate that the modal has been closed
                    resolve(dialogData);
                });

                btnCancel.addEventListener('click', () => {
                    // close the dialog
                    inputDialog.close();

                    // remove the element
                    $(inputDialog).remove();

                    // update the data of dialog
                    dialogData.operation = 0;

                    // Resolve the promise to indicate that the modal has been closed
                    resolve(dialogData);
                });
            }
        });
    }

    /**
     * Method of Dialog Class that allows user to change password
     * @param {innerText} textTitle Title of the dialog (only plain text)
     * @param {innerHTML} textMessage Message of the dialog (allows element tags)
     * @returns {Promise} Promise that resolves with the dialog data including the new password if OK is clicked.
     */
    static async changePasswordDialog(textTitle, textMessage) {
        // Create elements
        const inputDialog = document.createElement('dialog');
        const title = document.createElement('h4');
        const message = document.createElement('div');
        const form = document.createElement('form');
        const newPasswordInput = document.createElement('input');
        const confirmPasswordInput = document.createElement('input');
        const divButtons = document.createElement('div');
        const btnSave = document.createElement('button');
        const btnCancel = document.createElement('button');
        const errorMessage = document.createElement('div');

        // Add attributes and text
        newPasswordInput.setAttribute('class', 'form-control mb-3');
        confirmPasswordInput.setAttribute('class', 'form-control');
        inputDialog.setAttribute('id', 'inputDialog');
        title.setAttribute('id', 'title');
        message.setAttribute('id', 'message');
        divButtons.setAttribute('id', 'divButtons');
        btnSave.setAttribute('id', 'btnSave');
        btnSave.innerText = 'Save';
        btnCancel.setAttribute('id', 'btnCancel');
        btnCancel.innerText = 'Cancel';

        newPasswordInput.setAttribute('type', 'password');
        newPasswordInput.setAttribute('placeholder', 'New Password');
        newPasswordInput.setAttribute('id', 'newPassword');

        confirmPasswordInput.setAttribute('type', 'password');
        confirmPasswordInput.setAttribute('placeholder', 'Confirm Password');
        confirmPasswordInput.setAttribute('id', 'confirmPassword');

        errorMessage.setAttribute('id', 'errorMessage');
        errorMessage.style.color = 'red';

        // Append elements
        form.append(newPasswordInput, confirmPasswordInput, errorMessage);
        divButtons.append(btnSave, btnCancel);
        inputDialog.append(title, message, form, divButtons);
        document.body.prepend(inputDialog);

        const dialogData = {
            operation: 0,
            newPassword: null
        };

        return new Promise((resolve) => {
            // Display the modal with the message
            inputDialog.showModal();

            // Show the message
            title.innerText = textTitle;
            message.innerHTML = textMessage;

            btnSave.addEventListener('click', () => {
                const newPassword = newPasswordInput.value.trim();
                const confirmPassword = confirmPasswordInput.value.trim();

                if (newPassword === confirmPassword) {
                    // Close the dialog
                    inputDialog.close();
                    $(inputDialog).remove();

                    dialogData.operation = 1;
                    dialogData.newPassword = newPassword;

                    // Resolve the promise to indicate that the modal has been closed
                    resolve(dialogData);
                } else {
                    // Show error message
                    errorMessage.innerText = 'Passwords do not match. Please try again.';
                }
            });

            btnCancel.addEventListener('click', () => {
                // Close the dialog
                inputDialog.close();
                $(inputDialog).remove();

                // Resolve the promise to indicate that the modal has been closed
                resolve(dialogData);
            });

            newPasswordInput.addEventListener('input', validatePasswords);
            confirmPasswordInput.addEventListener('input', validatePasswords);

            function validatePasswords() {
                const newPassword = newPasswordInput.value.trim();
                const confirmPassword = confirmPasswordInput.value.trim();
                
                // Regular expression to check if the password contains both letters and numbers
                const hasLettersAndNumbers = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
                
                if (newPassword !== confirmPassword && confirmPassword.length > 0) {
                    errorMessage.innerText = 'Passwords do not match.';
                } else if (!hasLettersAndNumbers.test(newPassword)) {
                    errorMessage.innerText = 'Password must be at least 8 characters \nand include both letters and numbers.';
                } else {
                    errorMessage.innerText = '';
                }
            }
            
        });
    }

    static async showCropModal(cropImg, description, cropVariety) {
        // Create elements
        const modal = document.createElement('dialog');
        const container = document.createElement('div');
        const imgContainer = document.createElement('div');
        const img = document.createElement('img');
        const descContainer = document.createElement('div');
        const desc = document.createElement('div');
        const btnClose = document.createElement('button');
        const btnWrapper = document.createElement('div'); // Wrapper for the button

        // Add attributes
        modal.setAttribute('id', 'messageDialog');
        img.setAttribute('id', 'cropImg');
        img.setAttribute('src', cropImg);
        img.setAttribute('alt', 'Crop Image');
        img.style.width = '20rem'; // Adjust image size as needed
        img.style.height = 'auto'; // Maintain aspect ratio
        desc.setAttribute('id', 'cropDescription');
        desc.innerText = description;
        btnClose.setAttribute('id', 'btnClose');
        btnClose.innerText = 'Close';
        
        // Create headers
        const imgHeader = document.createElement('div');
        imgHeader.innerText = `${cropVariety}`;
        imgHeader.style.fontWeight = "bold";
        const descHeader = document.createElement('div');
        descHeader.innerText = 'Description: ';
        descHeader.style.fontWeight = "bold";
        
        // Style the elements
        modal.style.maxWidth = '700px'; // Adjust as needed
        modal.style.padding = '20px';
        modal.style.textAlign = 'center';
        
        container.style.display = 'flex';
        container.style.flexDirection = 'column'; // Stack all elements vertically
        container.style.alignItems = 'center'; // Center items horizontally
        container.style.gap = '20px'; // Space between image, description, and button
        
        imgContainer.style.display = 'flex';
        imgContainer.style.flexDirection = 'column'; // Stack header and image vertically
        imgContainer.style.alignItems = 'center'; // Center the image horizontally
        imgContainer.style.textAlign = 'center'; // Center the header and image horizontally
        
        descContainer.style.textAlign = 'left'; // Align text to the left
        descContainer.style.padding = '10px'; // Add padding to separate text from image
        
        // Style the button wrapper
        btnWrapper.style.display = 'flex';
        btnWrapper.style.justifyContent = 'center'; // Center the button horizontally
        
        // Append headers and content
        imgContainer.append(imgHeader, img);
        descContainer.append(descHeader, desc);
        btnWrapper.append(btnClose);
        container.append(imgContainer, descContainer, btnWrapper);
        modal.append(container);
        document.body.append(modal);
        
        // Create dialogData object
        const dialogData = {
            operation: 0, // Default operation
        };
        
        return new Promise((resolve) => {
            if (!modal.open) {
                // Display the modal
                modal.showModal();
        
                btnClose.addEventListener('click', () => {
                    // Close the modal
                    modal.close();
        
                    // Remove the element
                    modal.remove();
        
                    // Update dialogData to indicate close operation
                    dialogData.operation = 1;
        
                    // Resolve the promise with dialogData
                    resolve(dialogData);
                });
            }
        });
    }
    

static async downloadDialog() {
    // Create elements
    const inputDialog = document.createElement('dialog');
    const title = document.createElement('h5');
    const divButtons = document.createElement('div');
    const btnCSV = document.createElement('button');
    const btnExcel = document.createElement('button');
    const btnPDF = document.createElement('button');
    const closeButton = document.createElement('button');

    // Add attributes and text
    inputDialog.setAttribute('id', 'downloadModal');

    // Modal header
    title.className = 'modal-title';
    title.id = 'downloadModalLabel';
    title.innerText = 'Download Options';

    closeButton.type = 'button';
    closeButton.innerText = 'Close';
    closeButton.className = 'modal-close-button btn btn-secondary';
    closeButton.addEventListener('click', () => {
        inputDialog.close();
    });

    // Modal buttons
    btnCSV.className = 'btn btn-primary';
    btnCSV.innerText = 'Download CSV';
    btnCSV.setAttribute('data-format', 'csv');

    btnExcel.className = 'btn btn-primary';
    btnExcel.innerText = 'Download Excel';
    btnExcel.setAttribute('data-format', 'xlsx');

    btnPDF.className = 'btn btn-primary';
    btnPDF.innerText = 'Download PDF';
    btnPDF.setAttribute('data-format', 'pdf');

    // Create a new promise each time the dialog is opened
    let resolvePromise;
    const formatPromise = new Promise((resolve) => {
        resolvePromise = resolve;
    });

    // Add event listeners for buttons
    [btnCSV, btnExcel, btnPDF].forEach(button => {
        button.addEventListener('click', (event) => {
            const format = event.target.getAttribute('data-format');
            if (resolvePromise) {
                resolvePromise(format);  // Resolve the promise with the selected format
            }
            inputDialog.close();  // Close the dialog after selection
        });
    });

    // Styling for buttons and modal
    divButtons.className = 'modal-body';
    divButtons.style.display = 'grid';
    divButtons.style.gridTemplateColumns = 'repeat(3, 1fr)';
    divButtons.style.gap = '10px';
    divButtons.style.marginBottom = '20px';
    divButtons.append(btnCSV, btnExcel, btnPDF);

    // Assemble the dialog
    inputDialog.append(title, divButtons, closeButton);
    document.body.appendChild(inputDialog);

    // Style the close button
    closeButton.style.display = 'block';
    closeButton.style.margin = '0 auto';
    closeButton.style.marginTop = '10px';

    // Show the dialog
    inputDialog.showModal();

    // Return the promise that resolves with the selected format
    return formatPromise;
}


static async showInfoModal(htmlScript) {
    // Create elements
    const modal = document.createElement('dialog');
    const container = document.createElement('div');
    const btnClose = document.createElement('button');
    const btnWrapper = document.createElement('div'); // Wrapper for the button
    
    // Add attributes
    modal.setAttribute('id', 'messageDialog');
    btnClose.setAttribute('id', 'btnClose');
    btnClose.innerText = 'Close';
    
    // Style the modal
    modal.style.maxWidth = '1000px'; // Adjust as needed
    modal.style.padding = '20px';
    modal.style.fontSize = '1em';
    modal.style.textAlign = 'justify';
    modal.style.margin = '20px'; // Margin around the modal
    
    // Style the container
    container.style.display = 'flex';
    container.style.flexDirection = 'column'; // Stack content and button
    container.style.alignItems = 'center'; // Center items horizontally
    container.style.gap = '20px'; // Space between content and button
    container.style.margin = '20px'; // Margin around the content
    
    // Render the HTML script inside the container
    container.innerHTML = htmlScript;

    // Style the button wrapper
    btnWrapper.style.display = 'flex';
    btnWrapper.style.justifyContent = 'flex-end'; // Align items to the right
    
    // Append content and button
    btnWrapper.append(btnClose);
    container.append(btnWrapper);
    modal.append(container);
    document.body.append(modal);
    
    // Create dialogData object
    const dialogData = {
        operation: 0, // Default operation
    };
    
    return new Promise((resolve) => {
        if (!modal.open) {
            // Display the modal
            modal.showModal();
    
            btnClose.addEventListener('click', () => {
                // Close the modal
                modal.close();
    
                // Remove the element
                modal.remove();
    
                // Update dialogData to indicate close operation
                dialogData.operation = 1;
    
                // Resolve the promise with dialogData
                resolve(dialogData);
            });
        }
    });
}


}

export default Dialog;


// modal for download, concern, info