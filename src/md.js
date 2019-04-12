import template from "./template";
import marked from "marked";

const LANGUAGE_ROOT =
  "https://cdn.jsdelivr.net/npm/@observablehq/highlight.js@2.0.0-alpha.3/";

export default function(require) {
  return function() {
    return template(
      function(string) {
        var root = document.createElement("div");
        root.innerHTML = marked(string, { langPrefix: "" }).trim();
        var code = root.querySelectorAll("pre code[class]");
        if (code.length > 0) {
          require(LANGUAGE_ROOT + "highlight.min.js").then(function(hl) {
            code.forEach(function(block) {
              function done() {
                hl.highlightBlock(block);
                block.parentNode.classList.add("observablehq--md-pre");
              }
              if (!hl.getLanguage(block.className)) {
                require(LANGUAGE_ROOT + "async-languages/index.js")
                  .then(index => {
                    if (index.has(block.className)) {
                      return require(LANGUAGE_ROOT +
                        "async-languages/" +
                        index.get(block.className)).then(language => {
                        hl.registerLanguage(block.className, language);
                      });
                    }
                  })
                  .then(done, done);
              } else {
                done();
              }
            });
          });
        }
        return root;
      },
      function() {
        return document.createElement("div");
      }
    );
  };
}
