// Données linguistiques du Galme, reprises telles quelles du dépôt d'origine. NE PAS MODIFIER la langue.
export const U:string[]=["Pronoms","Grammaire et petits mots","Verbes","Salutations et mots du quotidien","Noms et adjectifs","Phrases"];
export const NOTES:string[]=[
"<b>Ena</b> couvre « moi/je » et mes appartenances. À l’oral, <i>ena</i> peut s’abréger en « e- » (<i>e-kora lio sivo</i>) ; à l’écrit formel, on garde <b>ena</b>. <b>Siva</b> est une variante de <b>sivo</b>.",
"Ordre de la phrase : <b>sujet + verbe + complément</b>. <b>sha</b> exprime le contraire (<i>amora-sha</i>). <b>pre-</b> (passé) et <b>fu-</b> (futur) se placent avant le verbe ; <b>-vo</b> marque le conditionnel ; <b>-ko</b> pose la question, après le verbe. <b>lano</b> = ma/mon, <b>rae</b> = sa/son. Les adjectifs se placent <b>avant</b> le nom (<i>varo-mona</i> = grande monnaie). Un mot peut changer de terminaison sans changer de sens (funizi, funiza, funizo, funizu) : c’est pour que ça sonne bien à l’oreille.",
"Les terminaisons peuvent varier sans changer le sens. Exemples : <i>pre-daroke</i> (a donné), <i>fu-sagne</i> (saura). À l’oral, <i>daroke</i> peut devenir <i>droké</i>.",
"Les mots de politesse et de tous les jours.",
"L’adjectif se place toujours avant le nom.",
"Des phrases entières pour voir tout ça en action."
];
export const PRON=`<b>Prononciation.</b> La lettre <b>n</b> se prononce comme un H aspiré : <i>ena</i> se dit « eha », <i>lano</i> se dit « laho ». La lettre <b>n</b> est le vrai N : <i>nasamora</i>, <i>bambino</i>, <i>pokoselnar</i>, <i>saë</i>.`;

export const RAW=`ena|moi / je|0
sivo|toi / tu|0
narai|il / elle / on|0
josu|nous|0
vosu|vous|0
lorai|ils / elles|0
oni|il/lui|0
ona|elle|0
sha|non / pas / faux|1
pre-|passé|1
fu-|futur|1
-vo (ou ve-)|conditionnel|1
-ko|question|1
lano|mon / ma / me|1
rae|son / sa / à lui / à elle|1
lanoslo|notre / dans notre|1
o|comme / avec / à|1
bi|que|1
eda|et|1
odia|ou|1
thoda|mais|1
zebo|pour|1
skoro bi|étant donné que|1
bardio|grâce à|1
na|le / la|1
vi|oui / vrai / bien / bon|1
roloza|bien/super/génial|1
eh|quoi|1
san|ça / ce / cette / cet|1
lazo|pourquoi|1
seran|certains|1
durama|durant/pendant|1
ilie|être|2
lio|avoir|2
saroke|venir|2
varoka|aller|2
loroke|faire / travailler|2
sagne|savoir|2
sogno|personne|2
kanora (kenara)|comprendre / pouvoir|2
devora|devoir|2
namen|prendre|2
maha|acheter|2
catya|couper|2
sela|vendre|2
daroke|donner|2
amora|aimer|2
manka|manquer|2
yono|empêcher|2
spozi|parler|2
kala|appeler|2
rigna|diriger|2
funizi|devenir|2
kuye|dire|2
selore|dire|2
malo|penser|2
dormara|se reposer|2
najai|Elle/Il/Lui|2
hesidare|hésiter|2
tsushima|dominer|2
delora|vouloir|2
credo|croire|2
zhoyama|bonjour|3
viwansaj|bonsoir|3
kaska|chapeau|3
namen kaska|prendre son chapeau = féliciter|3
vayara sola pazo|bonne nuit|3
sola|soleil|3
pazo|paix|3
pajol|l'avare|3
visna|verre|3
nas|en|3
von|eau|3
vonona|vodka|3
vayara|résultat|3
nasamora|au revoir|3
chi|merci|3
selami|s’il te plaît|3
ehisarok|bienvenue|3
vrayama|vraiment|3
nuna|maintenant|3
zolo|seul|3
poko|un peu/petit|3
sali-vuro|à lui|3
mona|argent / monnaie|4
varo|grand|4
morila|tristesse|4
zhomer|la loi|4
sosiede|la société|4
lliochi|yeux|4
fayida|échec / faillite|4
fela|chat|4
kora|cœur|4
luna|lune|4
noxe|nuit|4
moti|mot|4
dia|dieu|4
fozel|peuple|4
selzis|femme|4
gnozo|homme|4
bambino|bébé|4
ami|ami|4
pi|pied|4
cavu|fesses|4
paffo|zizi|4
pokoselnar|micronation|4
selnar|pays|4
franzi|français|4
bela|beau / belle|4
spezo|spécial|4
deziro|désiré|4
puto|pute|4
gabei|pardon|4
zald|fils|4
shapagna|impossible / pas permi|4
ena amora siva|je t’aime|5
ena amora-sha siva|je ne t’aime pas|5
ena amora-ko siva ?|je t’aime ?|5
siva manka lano|tu me manques|5
siva kora ilie bela bela|son cœur est magnifique|5
ena kala Sacha|je m’appelle Sacha|5
siva kanora-ko ?|comprends-tu ?|5
ena spozi vi|je parle bien|5
vosu spozi-ko ?|vous parlez ?|5
siva amora eh-ko ?|tu aimes quoi ?|5
san eh san-ko ?|c’est quoi ça ?|5
san ilie lano fozel|ça, c’est mon peuple|5
thoda ena malo malo ena|mais je pense par moi-même|5
ena fu-saroke nuna, devora sha hesidare|je viens maintenant, pas besoin d’hésiter|5
narai pre-daroke sivo mona, thodo siva pre-vramdra sha|il t’a donné ton argent, mais tu ne l’as pas pris|5
dia zolo fu-sagne|dieu seul saura|5
ena ve-sela zebo san|je vendrais pour ceci|5
ena tsushima sivo|je te domine|5
ena poko spozi na Galme, thoda, ena vi spozi na franzi|je parle un peu le galme, mais je parle bien le français|5`;
export const TD:string[]=["Pronom","Particule","Verbe","Expression","Nom","Phrase"];
export const TX:Record<string,string>={vi:"Adverbe",roloza:"Adverbe",eh:"Pronom",najai:"Pronom",delora:"Verbe",credo:"Verbe",kaska:"Nom",pajol:"Nom",visna:"Nom",nas:"Particule","namen kaska":"Expression",von:"Nom",vonona:"Nom",morila:"Nom",gabei:"Expression",san:"Pronom",lazo:"Adverbe",seran:"Pronom",sogno:"Nom",najai:"Pronom",sola:"Nom",pazo:"Nom",vayara:"Nom",vrayama:"Adverbe",nuna:"Adverbe",zolo:"Adjectif",poko:"Adverbe","sali-vuro":"Pronom",varo:"Adjectif",bela:"Adjectif",spezo:"Adjectif",deziro:"Adjectif",shapagna:"Adjectif",franzi:"Adjectif"};
export const TO:string[]=["Pronom","Verbe","Nom","Adjectif","Adverbe","Particule","Expression","Phrase"];
export const TT:Record<string,string>={Pronom:"Pronoms",Verbe:"Verbes",Nom:"Noms",Adjectif:"Adjectifs",Adverbe:"Adverbes",Particule:"Particules et petits mots",Expression:"Expressions",Phrase:"Phrases"};
