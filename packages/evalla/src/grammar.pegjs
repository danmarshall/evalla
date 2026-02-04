// Peggy grammar for evalla expressions
// Produces AST compatible with Acorn/ESTree format
{
  function buildBinaryExpression(head, tail) {
    return tail.reduce((left, element) => {
      return {
        type: 'BinaryExpression',
        operator: element[1],
        left: left,
        right: element[3]
      };
    }, head);
  }
}

// Main expression entry point
Expression
  = _ expr:ConditionalExpression _ { return expr; }

// Conditional (ternary) operator
ConditionalExpression
  = test:LogicalOrExpression _ "?" _ consequent:Expression _ ":" _ alternate:ConditionalExpression {
      return {
        type: 'ConditionalExpression',
        test: test,
        consequent: consequent,
        alternate: alternate
      };
    }
  / LogicalOrExpression

// Logical operators
LogicalOrExpression
  = head:LogicalAndExpression tail:(_ ("||" / "??") _ LogicalAndExpression)* {
      return tail.reduce((left, element) => {
        return {
          type: 'LogicalExpression',
          operator: element[1],
          left: left,
          right: element[3]
        };
      }, head);
    }

LogicalAndExpression
  = head:EqualityExpression tail:(_ "&&" _ EqualityExpression)* {
      return tail.reduce((left, element) => {
        return {
          type: 'LogicalExpression',
          operator: element[1],
          left: left,
          right: element[3]
        };
      }, head);
    }

// Equality operators
EqualityExpression
  = head:RelationalExpression tail:(_ ("===" / "!==" / "==" / "!=") _ RelationalExpression)* {
      return buildBinaryExpression(head, tail);
    }

// Relational operators
RelationalExpression
  = head:AdditiveExpression tail:(_ ("<=" / ">=" / "<" / ">") _ AdditiveExpression)* {
      return buildBinaryExpression(head, tail);
    }

// Additive operators
AdditiveExpression
  = head:MultiplicativeExpression tail:(_ ("+" / "-") _ MultiplicativeExpression)* {
      return buildBinaryExpression(head, tail);
    }

// Multiplicative operators
MultiplicativeExpression
  = head:ExponentiationExpression tail:(_ ("*" / "/" / "%") _ ExponentiationExpression)* {
      return buildBinaryExpression(head, tail);
    }

// Exponentiation operator
ExponentiationExpression
  = head:UnaryExpression tail:(_ "**" _ ExponentiationExpression)? {
      if (tail) {
        return {
          type: 'BinaryExpression',
          operator: '**',
          left: head,
          right: tail[3]
        };
      }
      return head;
    }

// Unary operators
UnaryExpression
  = operator:("+" / "-" / "!") _ argument:UnaryExpression {
      return {
        type: 'UnaryExpression',
        operator: operator,
        argument: argument,
        prefix: true
      };
    }
  / MemberExpression

// Member and call expressions
MemberExpression
  = head:PrimaryExpression tail:(
      _ "(" _ args:ArgumentList? _ ")" { return { type: 'call', args: args || [] }; }
      / _ "[" _ prop:Expression _ "]" { return { type: 'member', property: prop, computed: true }; }
      / _ "." _ prop:Identifier { return { type: 'member', property: prop, computed: false }; }
    )* {
      return tail.reduce((object, element) => {
        if (element.type === 'call') {
          return {
            type: 'CallExpression',
            callee: object,
            arguments: element.args
          };
        } else {
          return {
            type: 'MemberExpression',
            object: object,
            property: element.property,
            computed: element.computed
          };
        }
      }, head);
    }

ArgumentList
  = head:Expression tail:(_ "," _ Expression)* {
      return [head].concat(tail.map(t => t[3]));
    }

// Primary expressions
PrimaryExpression
  = Literal
  / ArrayLiteral
  / ObjectLiteral
  / Identifier
  / "(" _ expr:Expression _ ")" { return expr; }

// Literals
Literal
  = NumericLiteral
  / BooleanLiteral
  / NullLiteral
  / StringLiteral

NumericLiteral
  = raw:$([0-9]+ ("." [0-9]+)? ([eE] [+-]? [0-9]+)?) {
      return {
        type: 'Literal',
        value: parseFloat(raw),
        raw: raw
      };
    }

BooleanLiteral
  = "true" { return { type: 'Literal', value: true, raw: 'true' }; }
  / "false" { return { type: 'Literal', value: false, raw: 'false' }; }

NullLiteral
  = "null" { return { type: 'Literal', value: null, raw: 'null' }; }

StringLiteral
  = '"' chars:DoubleStringCharacter* '"' {
      return {
        type: 'Literal',
        value: chars.join(''),
        raw: '"' + chars.join('') + '"'
      };
    }
  / "'" chars:SingleStringCharacter* "'" {
      return {
        type: 'Literal',
        value: chars.join(''),
        raw: "'" + chars.join('') + "'"
      };
    }

DoubleStringCharacter
  = !["\\] char:. { return char; }
  / "\\" sequence:EscapeSequence { return sequence; }

SingleStringCharacter
  = !['\\] char:. { return char; }
  / "\\" sequence:EscapeSequence { return sequence; }

EscapeSequence
  = "n" { return "\n"; }
  / "r" { return "\r"; }
  / "t" { return "\t"; }
  / char:. { return char; }

// Array literals
ArrayLiteral
  = "[" _ elements:ElementList? _ "]" {
      return {
        type: 'ArrayExpression',
        elements: elements || []
      };
    }

ElementList
  = head:Expression tail:(_ "," _ Expression)* {
      return [head].concat(tail.map(t => t[3]));
    }

// Object literals
ObjectLiteral
  = "{" _ properties:PropertyList? _ "}" {
      return {
        type: 'ObjectExpression',
        properties: properties || []
      };
    }

PropertyList
  = head:Property tail:(_ "," _ Property)* {
      return [head].concat(tail.map(t => t[3]));
    }

Property
  = key:PropertyKey _ ":" _ value:Expression {
      return {
        type: 'Property',
        key: key,
        value: value,
        kind: 'init',
        method: false,
        shorthand: false,
        computed: false
      };
    }

PropertyKey
  = Identifier
  / StringLiteral
  / NumericLiteral

// Identifiers - NO KEYWORD RESTRICTIONS
// This is the key difference from JavaScript - all identifiers are allowed
Identifier
  = !ReservedLiteral name:$([a-zA-Z_$] [a-zA-Z0-9_$]*) {
      return {
        type: 'Identifier',
        name: name
      };
    }

// Reserved literals that cannot be identifiers
ReservedLiteral
  = ("true" / "false" / "null") ![a-zA-Z0-9_$]

// Whitespace (including newlines)
_ "whitespace"
  = [ \t\n\r]*
