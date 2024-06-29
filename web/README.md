# Lancer les commandes suivantes

Installer les modules:
### `npm i`

Executer sass:
### `npm run watch:sass`

Executer react:
### `npm start`


# Utiliser sass

SASS compile le scss de main.scss dans le fichier style.css.

### répartition des fichiers scss
Dans le dossier styles, les fichiers sont réparties en dossier en fonction de leur utilité:
- base: CSS regroupant le style global des éléments 
- composants: Elements qui compose les pages
- fonts: typo
- pages: les pages du site web
- utils: On y retrouvera les variables et les mixins

### Variables et mixins
- Une variable est comme une variable JS, on lui définit un nom et on lui assigne une valeur (ex: $color1: 'black'). Elle peut ensuite être utilisée dans n'importe quel fichier scss.
- Une mixin est comme une fonction, on lui assigne un nom et elle peut regrouper plusieurs styles (ex: @mixin gradient($start-color, $end-color) {background-image: linear-gradient(to bottom,$start-color, $end-color);}).
- Vous pouvez ajouter aux fichiers variables et mixins dans utils autant de variables et de mixins que vous le souhaitez.

### Ajouter un fichier scss
Pour ajouter un fichier scss, il faut le mettre dans le bon dossier (définit plus haut), son nom doit commencer par "_" et il doit avoir pour format ".scss".
Il faut ensuite l'ajouter au fichier main.scss en commencant par "@import" suivie du chemin du fichier. 
Attention, il faut l'ajouter en dessous des autres. L'ordre d'importation est important.
Attention, le dernier élément de votre page (hormis le footer) doit avoir obligatoirement ces instructions `margin-bottom: 0; padding-bottom: 4em;`.

# Structure react

J'ai divisé les fichiers jsx en 2 dossiers: Components et pages. 
Les components sont des éléments qui compose les pages et les pages rassemblents ces éléments. 
S'il faut rajouter un components ou une page, il suffit de créer un fichier jsx dans un des 2 dossiers et avoir au minimum la structure:

<!-- import React from 'react';

function test() {
    return (
        <div>
            <p>test 1</p>
        </div>
    );
}

export default test; -->

Si c'est une page, il faut l'importer dans App.jsx puis lui assigner un chemin gràce au router de react (ex: `<Route path="/test" element={<test/>}/>`) à mettre entre les balises Routes.