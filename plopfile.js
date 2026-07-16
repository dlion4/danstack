export default function (plop) {
  plop.setGenerator('feature-component', 'component', {
    description: 'Create a component inside a specific feature domain',
    prompts: [
      {
        type: 'list',
        name: 'feature',
        message: 'Which feature area does this belong to?',
        choices: ['home', 'authentication', 'dashboards/personal', 'dashboards/business', 'dashboards/utilities'],
      },
      {
        type: 'list',
        name: 'componentType',
        message: 'What type of component is this?',
        choices: ['features', 'components',],
      },
      {
        type: 'input',
        name: 'name',
        message: 'Component name (e.g., InvoiceTable):',
      },
    ],
    actions: [
      {
        type: 'add',
        path: 'src/{{componentType}}/{{pascalCase name}}.tsx',
        template: `import React from 'react';\n\nexport const {{pascalCase name}} = () => {\n  return (\n    <div className="{{kebabCase name}}">\n      {/* Migrated HTML goes here */}\n    </div>\n  );\n};\n`,
      },
    ],
  });
}

// export default function (plop) {
//   plop.setGenerator('component', {
//     description: 'Create a new reusable UI component',
//     prompts: [
//       {
//         type: 'input',
//         name: 'name',
//         message: 'What is the component name (e.g. SkillCard)?',
//       },
//     ],
//     actions: [
//       {
//         type: 'add',
//         path: 'src/components/{{pascalCase name}}/{{pascalCase name}}.tsx',
//         template: `import React from 'react';\n\nexport const {{pascalCase name}} = () => {\n  return (\n    <div className="{{kebabCase name}}">\n      {{pascalCase name}} Component\n    </div>\n  );\n};\n`,
//       },
//     ],
//   });
// }
