// @flow
'use strict';

/*::
type Node = {
  type: string,
  [key: string]: any,
};

type Path = {
  node: Node,
  [key: string]: any,
};
*/

const GLOBAL_NAME = 'React';
const MODULE_NAME = 'react';

let getBinding = path => {
  return path.scope.getBinding(path.node.name);
};

let isReactComponentMember = path => {
  return path.node.name === 'Component' || path.node.name === 'PureComponent';
};

let getSourceFromSpecifier = path => {
  return path.parent.source.value;
};

function isReactComponentClass(path /*: Path */) {
  if (!path.isClass()) return false;

  let superClass = path.get('superClass');
  if (!superClass.node) return false;

  if (superClass.isMemberExpression()) {
    let object = superClass.get('object');
    let property = superClass.get('property');

    if (!object.isIdentifier()) return false;

    let binding = getBinding(object);

    if (!binding) {
      if (object.node.name !== GLOBAL_NAME) return false;
    } else {
      if (binding.kind !== 'module') return false;
      if (!binding.path.isImportDefaultSpecifier() && !binding.path.isImportNamespaceSpecifier()) return false;
      if (getSourceFromSpecifier(binding.path) !== MODULE_NAME) return false;
    }

    return isReactComponentMember(property);
  }

  if (superClass.isIdentifier()) {
    let binding = getBinding(superClass);
    if (!binding) return false;

    if (binding.kind !== 'module') return false;
    if (!binding.path.isImportSpecifier()) return false;
    if (getSourceFromSpecifier(binding.path) !== MODULE_NAME) return false;
    if (!isReactComponentMember(binding.path.get('imported'))) return false;

    return true;
  }

  throw superClass.buildCodeFrameError(
    `Unexpected super class type: ${superClass.type}`
  );
}

exports.isReactComponentClass = isReactComponentClass;
