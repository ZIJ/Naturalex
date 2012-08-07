/**
 * Created with JetBrains WebStorm.
 * User: ZIJ
 * Date: 7.08.12
 * Time: 22:32
 * To change this template use File | Settings | File Templates.
 */

(function ($) {
    /**
     * Sorts DOM node's children in lexicographical order using optional key extractor
     * @param extractor should accept one param - node object
     */
    $.fn.sortChildren = function (extractor) {
        if(typeof(extractor) !== 'function') {
            extractor = function(node) {
                return $(node).html();
            }
        }
        var children = this.children();
        var sortedChildren = naturalSort(children,extractor);
        this.empty();
        this.append(sortedChildren);
    }
})(jQuery);

/**
 * Sorts an array in natural order
 * @param arr
 * @param extractor optional function that makes string from an array item
 * @return {*|Array}
 */
function naturalSort(arr, extractor) {
    "use strict";
    //TODO: find out why map doesnt work
    var splitters = [];
    for (var i = 0; i<arr.length; i++) {
        splitters.push(new Splitter(arr[i]));
    }
    //var splitters = arr.map(makeSplitter);
    var sorted = insertionSort(splitters, compareSplitters);
    return sorted.map(function (splitter) {
        return splitter.item;
    });
    /**
     * Splitter wrapper
     * @param item
     * @return {Splitter}
     */
    function makeSplitter(item) {
        return new Splitter(item);
    }

    /**
     * Creates a Splitter - lazy string parsing object
     * @param item Key-containing object
     * @constructor
     */
    function Splitter(item) {
        var index = 0;          // string scanning index
        var from = 0;           // start index for parts
        var parts = [];         // parts array
        var completed = false;  // parsing finished flag

        this.item = item;
        // extracting key
        var key = (typeof (extractor) === 'function') ?
            extractor(item) :
            item;
        if (typeof(key) === 'string') {
            key = trim(key);
        } else {
            throw new TypeError('Key should be String');
        }
        this.key = key;
        // amount of parts found
        this.count = function () {
            return parts.length;
        };
        // checking key emptiness
        this.isEmpty = function () {
            return (key === '');
        }
        // getting part by index, parts[] array as preferable source
        this.part = function (i) {
            while (parts.length <= i && !completed) {
                next(); 	// going on with string processing
            }
            return (i < parts.length) ? parts[i] : null;
        };
        // parsing string till next part
        function next() {
            // string is not yet over
            if (index < key.length) {
                // working until non-digits/digits border
                while (++index) {
                    var currentIsDigit = isDigit(key.charAt(index - 1));
                    var nextChar = key.charAt(index);
                    var currentIsLast = (index === key.length);
                    // we reached the border if we're at the last char,
                    // or if current and next chars are of different kinds (digit / non-digit)
                    var isBorder = currentIsLast ||
                        xor(currentIsDigit, isDigit(nextChar));
                    if (isBorder) {
                        // creating new part
                        var partStr = key.slice(from, index);
                        parts.push(new Part(partStr, currentIsDigit));
                        from = index;
                        break;
                    }
                }
                // our string is over
            } else {
                completed = true;
            }
        }

        /**
         * Creates new Part
         * @param text
         * @param isNumber
         * @constructor
         */
        function Part(text, isNumber) {
            this.isNumber = isNumber;
            this.value = isNumber ? Number(text) : text;
        }
        // cleaning whitespace
        function trim(str) {
            return str.replace(/^\s+|\s+$/, "");
        }
    }

    /**
     * Compares two splitters utilizing their laziness
     * @param sp1
     * @param sp2
     * @return {*}
     */
    function compareSplitters(sp1, sp2) {
        // empty strings should be at the end
        if (sp1.isEmpty()) {
            return 1;
        } else if (sp2.isEmpty()) {
            return -1;
        }
        // handling parts
        var i = 0;
        do {
            var first = sp1.part(i);
            var second = sp2.part(i);
            // both parts exist
            if (null !== first && null !== second) {
                // parts of different types (digit / non-digit)
                if (xor(first.isNumber, second.isNumber)) {
                    return first.isNumber ? -1 : 1;     // digits are always "less"
                // parts of same type can be easily compared
                } else {
                    var comp = compare(first.value, second.value);
                    if (comp != 0) {
                        return comp;
                    }
                } // end if
            // the shorter string is always "less"
            } else {
                return compare(sp1.count(), sp2.count());
            }
        } while (++i);
        /**
         * conventional comparer
         */
        function compare(a, b) {
            return (a < b) ? -1 : (a > b) ? 1 : 0;
        };
    };
    /**
     * Exclusive 'or'
     * @param a
     * @param b
     * @return {Boolean}
     */
    function xor(a, b) {
        return a ? !b : b;
    };
    /**
     * Checking if character belongs to digits
     * @param chr
     * @return {Boolean}
     */
    function isDigit(chr) {
        var code = charCode(chr);
        return (code >= charCode('0')) && (code <= charCode('9'));
        function charCode(c) {
            return c.charCodeAt(0);
        };
    };
    /**
     * Insertion sort
     * @param arr
     * @param comparer
     * @return {*}
     */
    function insertionSort(arr, comparer) {
        for (var i = 0, j, tmp; i < arr.length; ++i) {
            tmp = arr[i];
            for (j = i - 1; j >= 0 && comparer(arr[j], tmp) >= 0; --j)
                arr[j + 1] = arr[j];
            arr[j + 1] = tmp;
        }
        return arr;
    }
}
