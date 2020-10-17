var EmailsInput = (function () {
  // Constructor
  function EmailsInput(node) {
    this._node = node;
    this._blocks = [];

    node.setAttribute('contenteditable', 'true');
    node.className = 'emails-input';

    // Event handlers
    var _createBlockHandler = createBlockHandler.bind(this);
    this._eventHandlers = [
      {type: 'keydown', fn: _createBlockHandler},
      {type: 'blur', fn: _createBlockHandler},
      {type: 'paste', fn: pasteHandler.bind(this)},
      {type: 'click', fn: deleteBlockHandler.bind(this)},
      {type: 'DOMNodeRemoved', fn: nodeRemovalHandler.bind(this)},
      {
        type: 'mscontrolselect', fn: function (e) {
          e.preventDefault();
        }
      },
    ];

    // Add events
    for (var i = 0; i < this._eventHandlers.length; i++) {
      var mapping = this._eventHandlers[i];
      node.addEventListener(mapping.type, mapping.fn);
    }
  }

  // Private methods

  function createBlockHandler(e) {
    // Lose focus, press "," "enter" or "space"
    if (e.type === 'blur' || e.keyCode === 188 || e.keyCode === 13 || e.keyCode === 32) {
      e.preventDefault();
      this.createBlocks();

      // Caret reset implies focus, and we don't need that upon blur
      if (e.type !== 'blur') resetCaret(e.target);
    }
  }

  function pasteHandler(e) {
    // Get pasted data
    var data = e.clipboardData.getData('text/plain');

    // Sanitize
    var doc = new DOMParser().parseFromString(data, 'text/html');
    data = doc.body.textContent || "";

    // Process plain text
    if (data.length) this.createBlocks(data.split(','))
    e.preventDefault();
  }

  function deleteBlockHandler(e) {
    e.preventDefault();
    var node = e.target || e.srcElement;
    if (node.className === 'email-block-delete') {
      var block = node.parentNode;
      var input = block.parentNode;
      input.removeChild(block);
      resetCaret(input);
    }
  }

  function nodeRemovalHandler(e) {
    var node = e.target || e.srcElement;
    if (node === this._node) {
      this.destroy();
    } else if (node.nodeType === 1) {
      this._blocks.splice(this._blocks.indexOf(node), 1);
      var event = document.createEvent('Event');
      event.initEvent('block-remove', true, true);
      event.data = {email: node.querySelector('.email-block-content').textContent};
      node.dispatchEvent(event);
    }
  }

  function generateBlock(value) {
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

    this._blocks.push(block);
    return block;
  }

  function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  function resetCaret(node) {
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
        this._node.appendChild(generateBlock.call(this, values[i]));
        event.data = {email: values[i], method: 'arguments'};
        this._node.dispatchEvent(event);
      }
    }
    // Otherwise, all text nodes get converted into blocks
    else {
      var textNodeList = this._node.childNodes;
      var textNodes = Array.prototype.slice.call(textNodeList).filter(function (el) {
        return el.nodeType === 3;
      });
      for (var j = 0; j < textNodes.length; j++) {
        var value = textNodes[j].textContent;
        this._node.replaceChild(generateBlock.call(this, value), textNodes[j]);
        event.data = {email: value, method: 'user input'};
        this._node.dispatchEvent(event);
      }
    }
  }

  EmailsInput.prototype.replaceAllEmails = function (values) {
    var count = this._blocks.length;
    for (var i = 0; i < count; i++) {
      this._node.removeChild(this._blocks[0]);
    }
    this.createBlocks(values);
  }

  EmailsInput.prototype.getEmailCount = function () {
    return this._blocks.filter(
      function (el) {
        return el.className.indexOf('invalid') < 0;
      }).length;
  }

  EmailsInput.prototype.getAllEmails = function () {
    return this._blocks.map(
      function (el) {
        return el.querySelector('.email-block-content').textContent
      })
  }

  EmailsInput.prototype.destroy = function () {
    for (var i = 0; i < this._eventHandlers.length; i++) {
      var mapping = this._eventHandlers[i];
      this._node.removeEventListener(mapping.type, mapping.fn);
    }
  }

  return EmailsInput;
})();
