function equal(left, right){
    var type = typeof left;
    if(type === typeof right){
        switch(type){
            case 'object':
                var lKeys = Object.keys(left);
                var rKeys = Object.keys(right);
                if(lKeys.length === rKeys.length){
                    for(var i = 0; i < lKeys.length; i++){
                        var key = lKeys[i];
                        if(!right.hasOwnProperty(key) || (left[key] !== right[key])){
                            return false;
                        }
                    }
                    return true;
                } else {
                    return false;
                }
                break;
            default:
                return left === right;
        }
    } else {
        return false;
    }
}

/**
 *
 * @param left
 * @param right
 * @returns {boolean|*}
 */
function isMatch(left, right){
    return (left.name === right.name) && equal(left.attr, right.attr);
}

/**
 * Longest common subsequence
 * @param {Array} left
 * @param {Array} right
 * @param {Function} match
 * @returns {Array}
 * @constructor
 */
function LCS(left, right, match){
    var lastLine = [];
    var currLine = [];
    left.forEach(function(old){
        right.forEach(function(cur, x){
            if(match(old, cur)){
                var sequence = (lastLine[x-1] || []).slice(0);
                sequence.push({ l: old, r: cur });
                currLine[x] = sequence;
            } else {
                var lSeq = currLine[x-1];
                var tSeq = lastLine[x];
                if(lSeq && tSeq){
                    if(lSeq.length > tSeq.length){
                        currLine[x] = lSeq.slice(0);
                    } else {
                        currLine[x] = tSeq.slice(0);
                    }
                } else if(lSeq) {
                    currLine[x] = lSeq.slice(0);
                } else if(tSeq) {
                    currLine[x] = tSeq.slice(0);
                }
            }
        });
        lastLine = currLine;
        currLine = [];
    });
    return (lastLine.pop() || []);
}

/**
 * diff change
 * @type {exports}
 * @returns {Array}
 */
var diff = function(left, right, opt){
    var ret = [];
    var change = {
        type: 0,
        node: right
    };
    if(left.style !== right.style){
        change.type |= opt.changeType.STYLE;
    }
    LCS(left.child, right.child, isMatch).forEach(function(node){
        var old = node.l;
        var cur = node.r;
        cur.matched = old.matched = true;
        if(cur.name === '#'){
            if(old.text !== cur.text){
                // match node, but contents are different.
                change.type |= opt.changeType.TEXT;
            }
        } else {
            // recursive
            ret = ret.concat(diff(old, cur, opt));
        }
    });
    right.child.forEach(function(node){
        if(!node.matched){
            if(node.name === '#'){
                // add text, but count as text change
                change.type |= opt.changeType.TEXT;
            } else {
                // add element
                ret.push({
                    type: opt.changeType.ADD,
                    node: node
                });
            }
        }
    });
    left.child.forEach(function(node){
        if(!node.matched){
            // removed element
            ret.push({
                type: opt.changeType.REMOVE,
                node: node
            });
        }
    });
    if(change.type){
        ret.push(change);
    }
    return ret;
};

module.exports = diff;