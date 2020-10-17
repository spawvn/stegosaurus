#Stegosaurus

A simple component for multi-email input

### Compatibility
- All modern browsers
- Internet Explorer 11

### Dependencies
- None, it's all vanilla ES5

### Usage

Import the CSS, for example:
```html
<link rel = "stylesheet" type = "text/css" href = "components/emails-input/styles.css" />
```
Import the JavaScript, and then create a new EmailsInput instance like so:
```html
<div id="emails-input"></div>

<script src="components/emails-input/index.js"></script>
<script>
  var inputContainerNode = document.querySelector('#emails-input');
  var emailsInput = new EmailsInput(inputContainerNode);
</script>
```
It is possible to subscribe to custom events, 'block-add', and 'block-remove', they are dispatched upon addition or removal of email blocks respectively.
Example:
```javascript
inputContainerNode.addEventListener('block-add', function(e){
  console.log('block-add Event: ', e.data);
})
inputContainerNode.addEventListener('block-remove', function(e){
  console.log('block-remove Event: ', e.data);
})
```
###Public API:
#### createBlocks
Accepts:
- `values` [Array of Strings, optional]  

Adds email blocks to the end of the list. If `values` is not provided, it converts all user input text into blocks.

#### replaceAllEmails
Accepts:
- `values` [Array of Strings, optional]  

Removes all email blocks and adds new ones based on the provided list. If `values` is not provided, it only deletes existing email blocks.

#### getEmailCount
Returns: [Number]  

Counts all valid email blocks.

#### getAllEmails
Returns: [Array of Strings]  

Returns the values of all email blocks, both valid and invalid.
