// @flow
'use strict';

const {isReactComponentClass} = require('./');
const pluginTester = require('babel-plugin-tester');

const plugin = function({types: t}) {
  return {
    name: 'test-plugin',
    visitor: {
      ClassDeclaration(path) {
        if (isReactComponentClass(path)) {
          path.replaceWith(t.identifier('MATCHED'));
        }
      },
    },
  };
};

pluginTester({
  plugin: plugin,
  babelOptions: {
    parserOpts: {plugins: ['flow']},
  },
  tests: [
    {
      title: 'dont match no super class',
      code: 'class Foo {}',
      output: 'class Foo {}',
    },
    {
      title: 'dont match super class not react',
      code: 'class Foo extends Bar {}',
      output: 'class Foo extends Bar {}',
    },
    {
      title: 'dont match super class member expression not react',
      code: 'class Foo extends Bar.Baz {}',
      output: 'class Foo extends Bar.Baz {}',
    },
    {
      title: 'dont match super class member expression react not component',
      code: 'class Foo extends React.Baz {}',
      output: 'class Foo extends React.Baz {}',
    },
    {
      title: 'match super class member expression react component',
      code: 'class Foo extends React.Component {}',
      output: `MATCHED;`,
    },
    {
      title: 'match super class member expression react pure component',
      code: `class Foo extends React.PureComponent {}`,
      output: `MATCHED;`,
    },
    {
      title: 'dont match React if binding not correct import',
      code: `let React = {};\nclass Foo extends React.Component {}`,
    },
    {
      title: 'match React if binding correct default import',
      code: `import React from "react";\nclass Foo extends React.Component {}`,
      output: `import React from "react";\nMATCHED;`,
    },
    {
      title: 'match React if binding correct namespace import',
      code: `import * as React from "react";\nclass Foo extends React.Component {}`,
      output: `import * as React from "react";\nMATCHED;`,
    },
    {
      title: 'match React if binding correct named import',
      code: `import { Component } from "react";\nclass Foo extends Component {}`,
      output: `import { Component } from "react";\nMATCHED;`,
    },
    {
      title: 'dont match React if binding incorrect named import',
      code: `import { x } from "react";\nclass Foo extends x {}`,
    },
    {
      title: 'match React if binding correct renamed named import',
      code: `import { Component as x } from "react";\nclass Foo extends x {}`,
      output: `import { Component as x } from "react";\nMATCHED;`,
    },
    {
      title: 'dont match React if binding incorrect renamed named import',
      code: `import { x as Component } from 'react';\nclass Foo extends Component {}`,
    },
  ],
});
