var EmailsInput = (function () {
  // Constructor
  function EmailsInput(node) {
    this.node = node;
    node.setAttribute('contenteditable', 'true');
    node.className = 'emails-input';
    node.addEventListener('keydown', createBlockHandler.bind(this));
    node.addEventListener('blur', createBlockHandler.bind(this));
    node.addEventListener('click', deleteBlockHandler.bind(this));
    node.addEventListener('paste', pasteHandler.bind(this));
    node.addEventListener('DOMNodeRemoved', nodeRemovalHandler);
    node.addEventListener('mscontrolselect', function (e) {
      e.preventDefault();
    });
  }

  // Private methods

  var createBlockHandler = function (e) {
    // Lose focus, press "," "enter" or "space"
    if (e.type === 'blur' || e.keyCode === 188 || e.keyCode === 13 || e.keyCode === 32) {
      e.preventDefault();
      this.createBlocks();

      // Caret reset implies focus, and we don't need that upon blur
      if (e.type !== 'blur') resetCaret(e.target);
    }
  }

  var pasteHandler = function (e) {
    // Get pasted data
    var data = e.clipboardData.getData('text/plain');

    // Sanitize
    var doc = new DOMParser().parseFromString(data, 'text/html');
    data = doc.body.textContent || "";

    // Process plain text
    if (data.length) this.createBlocks(data.split(','))
    e.preventDefault();
  }

  var deleteBlockHandler = function (e) {
    e.preventDefault();
    var node = e.target || e.srcElement;
    if (node.className === 'email-block-delete') {
      var block = node.parentNode;
      var input = block.parentNode;
      input.removeChild(block);
      resetCaret(input);
    }
  }

  var nodeRemovalHandler = function (e) {
    var node = e.target || e.srcElement;
    if(node.nodeType === 1) {
      var event = document.createEvent('Event');
      event.initEvent('block-remove', true, true);
      event.data = {email: node.querySelector('.email-block-content').textContent};
      node.dispatchEvent(event);
    }
  }

  var generateBlock = function (value) {
    // Create container
    var block = document.createElement('div');
    block.className = 'emails-input-block';
    block.setAttribute('contenteditable', 'false');

    // Add content
    var content = document.createElement('span');
    content.className = 'email-block-content';
    content.innerHTML = value;
    if (!validateEmail(value)) block.classList.add('invalid');
    block.appendChild(content);

    //Create delete button
    var del = document.createElement('span');
    del.className = 'email-block-delete';
    del.setAttribute('role', 'button');
    del.innerHTML = '&#10006;';
    block.appendChild(del);

    return block;
  }

  var validateEmail = function (email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  var resetCaret = function (node) {
    node.focus();
    if (typeof window.getSelection != "undefined"
      && typeof document.createRange != "undefined") {
      var range = document.createRange();
      range.selectNodeContents(node);
      range.collapse(false);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    } else if (typeof document.body.createTextRange != "undefined") {
      var textRange = document.body.createTextRange();
      textRange.moveToElementText(node);
      textRange.collapse(false);
      textRange.select();
    }
  }

  // Public methods

  EmailsInput.prototype.createBlocks = function (values) {
    var event = document.createEvent('Event');
    event.initEvent('block-add', true, true);

    // If values are provided, user input is not processed
    if (Array.isArray(values) && values.length) {
      for (var i = 0; i < values.length; i++) {
        this.node.appendChild(generateBlock.call(this, values[i]));
        event.data = {email: values[i], method: 'arguments'};
        this.node.dispatchEvent(event);
      }
    }
    // Otherwise, all text nodes get converted into blocks
    else {
      var textNodeList = this.node.childNodes;
      var textNodes = Array.prototype.slice.call(textNodeList).filter(function (el) {
        return el.nodeType === 3;
      });
      for (var j = 0; j < textNodes.length; j++) {
        var value = textNodes[j].textContent;
        this.node.replaceChild(generateBlock.call(this, value), textNodes[j]);
        event.data = {email: value, method: 'user input'};
        this.node.dispatchEvent(event);
      }
    }
  }

  EmailsInput.prototype.replaceAllEmails = function (values) {
    var nodeList = this.node.querySelectorAll('.emails-input-block');
    for (var i = 0; i < nodeList.length; i++) {
      this.node.removeChild(nodeList[i]);
    }
    this.createBlocks(values);
  }

  EmailsInput.prototype.getEmailCount = function () {
    return this.node.querySelectorAll('.emails-input-block:not(.invalid)').length;
  }

  EmailsInput.prototype.getAllEmails = function () {
    var nodeList = this.node.querySelectorAll('.emails-input-block');
    return Array.prototype.slice.call(nodeList).map(
      function (el) {
        return el.querySelector('.email-block-content').textContent
      })
  }

  return EmailsInput;
})();
