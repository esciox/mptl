class Utility {
    constructor(){

    }

    static escapeHtml(sInput){

        // List of HTML entities for escaping.
        const htmlEscapes = {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#x27;',
          '/': '&#x2F;'
        };

        return ('' + sInput).replace(/[&<>"'\/]/g, function(match) {
            return htmlEscapes[match];
        });

    }
    
}

module.exports = Utility;