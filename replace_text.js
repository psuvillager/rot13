// This is how the rot13 cypher itself works
function rot13(str) {
  return str.split("").map(function(c) {
    // Ignores non-alphabetic characters
    const lowerCharCode = c.toLowerCase().charCodeAt(0)
    if (lowerCharCode < 97 || lowerCharCode > 122) { return c; }

    // Shifts first half of (lowercase) alphabet to last half, and vice versa
    const convertedLower = String.fromCharCode(
      (lowerCharCode - 97 + 13) // `a` is 13, `b` is 14..
      % 26 // `n` is 0, `o` is 1..
      + 97 // Shifts back up to lowerCharCode range -- so `a` is `n`, `b` is `o`.. (and vice versa)
    );
    // Switches to uppercase if appropriate
    const
      wasUppercase = c.toUpperCase() === c,
      converted = wasUppercase ? convertedLower.toUpperCase() : convertedLower;
   return converted;
  }).join("");
}



// ---------------------------------------------------------------------------------------
//   This is how we modify all selected text on a page, even spread across many elements 
// ---------------------------------------------------------------------------------------

// Selections entirely contained within text inputs can be manipulated directly...
if (document.activeElement.nodeName === "TEXTAREA" || document.activeElement.nodeName === "INPUT") {
  const
    ta = document.activeElement, // document.activeElement
    start = ta.selectionStart,
    end = ta.selectionEnd,
    beforeSelected = ta.value.slice(0, start),
    selected = ta.value.slice(start, end),
    afterSelected = ta.value.slice(end);
  ta.value = beforeSelected + rot13(selected) + afterSelected;

  // Sets selection back to its original position
  ta.selectionStart = start;
  ta.selectionEnd = end;
}

// ...otherwise, we iterate through all text nodes in the range corresponding to the selection
else {
  const sel = window.getSelection(); // window.getSelection
  for (let r = 0; r < sel.rangeCount; ++r) {
    const
      range = sel.getRangeAt(0), // selection.getRangeAt
      startOffset = range.startOffset,
      endOffset = range.endOffset,

      selectedTextNodes = document.createNodeIterator( // developer.mozilla.org/en-US/docs/Web/API/NodeIterator
        range.commonAncestorContainer,
        NodeFilter.SHOW_TEXT, // developer.mozilla.org/en-US/docs/Web/API/NodeFilter
        function(n) { 
          const
            parentIsStyleOrScript = ["style","script"].includes(n.parentNode.nodeName.toLowerCase()),
            selectionExcludesNode = !sel.containsNode(n, true);
          return (parentIsStyleOrScript || selectionExcludesNode)
            ? NodeFilter.FILTER_REJECT
            : NodeFilter.FILTER_ACCEPT;
        }
      );

    const node;
    while (node = selectedTextNodes.nextNode()) {
      // Work around a bug(?) in containsNode that unexpectedly returns true for the first text node in the element AFTER the selection
      if(range.endContainer !== range.startContainer && range.endContainer.nodeType !== Node.TEXT_NODE && range.endContainer.contains(node)) { continue; }
      const
        // (Acts appropriately if the selection begins/ends in the middle of the current text node)
        begin = (node == range.startContainer) ? startOffset : 0,
        end = (node == range.endContainer) ? endOffset : Infinity,
        text = node.nodeValue,
        beforeSelected = text.slice(0, begin),
        selected = text.slice(begin, end),
        afterSelected = text.slice(end);
      node.nodeValue = beforeSelected + rot13(selected) + afterSelected;
    }
    // Sets selection back to its original position
    range.setStart(range.startContainer, startOffset);
    range.setEnd(range.endContainer, endOffset);
  }
}
