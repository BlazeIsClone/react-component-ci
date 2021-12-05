import { readdirSync, mkdirSync, writeFileSync, readFileSync } from 'fs';

const getDirectories = source =>
  readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

export const generate = args => {
  const componentName = args
    ?.find(arg => arg.includes('name='))
    ?.split('=')[1];

  if (!componentName) {
    throw new Error(
      'Component name must be provided: try name=myComponent',
    );
  } else if (componentName.length > 35) {
    throw new Error('Component name must be 35 characters or less');
  }

  const componentDir = './src/components';
  const existingDirectories = getDirectories(componentDir);
  const newComponentDir = `${componentDir}/${componentName}`;

  if (existingDirectories.includes(componentName)) {
    throw new Error(
      'This component name already exists. Please choose a different name.',
    );
  }

  mkdirSync(newComponentDir);

  const componentFileName =
    componentName.charAt(0).toUpperCase() + componentName.slice(1);

  writeFileSync(
    `${newComponentDir}/${componentFileName}.module.scss`,
    `.main {\n}\n`,
  );

  writeFileSync(
    `${newComponentDir}/index.js`,
    `export * from './${componentFileName}';\n`,
  );

  writeFileSync(
    `${newComponentDir}/${componentFileName}.jsx`,
    `import styles from './${componentFileName}.module.scss';

export const ${componentFileName} = () => {  
  return (
    <div className={styles.main}>${componentName}</div>
    )
};`,
  );

  const strBuffer = readFileSync('./src/components/index.js');

  const indexContents = strBuffer
    .toString()
    .split('\n')
    .filter(each => each);

  const updatedContents = [
    ...indexContents,
    `export * from './${componentName}';`,
  ].sort((a, b) => a.length - b.length);

  writeFileSync('./src/components/index.js', updatedContents.join('\n'));
};
