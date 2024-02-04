import figlet from 'figlet';

export async function brandFiglet() {
  let fig = 'AsciiFolders';
  await figlet.text(
    'AsciiFolders',
    {
      font: 'Big',
      horizontalLayout: 'default',
      verticalLayout: 'default',
      whitespaceBreak: false,
    },
    function (err, data) {
      if (err) {
        console.log('Something went wrong...');
        console.dir(err);
        return;
      }
      fig = data || '';
    }
  );
  return fig;
}
