// Extract variable names from an AST node
// Returns root variable names (e.g., 'point' from 'point.x')
export const extractVariablesFromAST = (node: any): string[] => {
  const variables = new Set<string>();
  
  const visit = (n: any) => {
    if (!n || typeof n !== 'object') return;
    
    switch (n.type) {
      case 'Identifier':
        // Don't add identifiers that are property names in member expressions
        variables.add(n.name);
        break;
        
      case 'MemberExpression':
        // For a.b.c, we only want the root variable 'a'
        // Visit the object part, but not the property part (unless computed)
        visit(n.object);
        if (n.computed) {
          visit(n.property);
        }
        break;
        
      case 'BinaryExpression':
      case 'LogicalExpression':
        visit(n.left);
        visit(n.right);
        break;
        
      case 'UnaryExpression':
        visit(n.argument);
        break;
        
      case 'CallExpression':
        visit(n.callee);
        if (n.arguments) {
          for (const arg of n.arguments) {
            visit(arg);
          }
        }
        break;
        
      case 'ConditionalExpression':
        visit(n.test);
        visit(n.consequent);
        visit(n.alternate);
        break;
        
      case 'ArrayExpression':
        if (n.elements) {
          for (const element of n.elements) {
            visit(element);
          }
        }
        break;
        
      case 'ObjectExpression':
        if (n.properties) {
          for (const prop of n.properties) {
            if (prop.type === 'Property') {
              // Visit computed keys and all values
              if (prop.computed) {
                visit(prop.key);
              }
              visit(prop.value);
            } else if (prop.type === 'SpreadElement') {
              visit(prop.argument);
            }
          }
        }
        break;
        
      case 'Literal':
        // Literals don't contain variables
        break;
        
      default:
        // For safety, don't extract from unknown node types
        break;
    }
  };
  
  visit(node);
  
  // Filter out $ -prefixed identifiers (system namespaces)
  return Array.from(variables).filter(v => !v.startsWith('$'));
};
