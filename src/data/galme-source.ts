// Données linguistiques du Galme, reprises telles quelles du dépôt d'origine. NE PAS MODIFIER la langue.
export const U:string[]=["Pronoms","Grammaire et petits mots","Verbes","Salutations et mots du quotidien","Noms et adjectifs","Phrases"];
export const NOTES:string[]=[
"<b>Ena</b> couvre « moi/je » et mes appartenances. À l’oral, <i>ena</i> peut s’abréger en « e- » (<i>e-kora lio sivo</i>) ; à l’écrit formel, on garde <b>ena</b>. <b>Siva</b> est une variante de <b>sivo</b>.",
"Ordre de la phrase : <b>sujet + verbe + complément</b>. <b>sha</b> exprime le contraire (<i>amora-sha</i>). <b>pre-</b> (passé) et <b>fu-</b> (futur) se placent avant le verbe ; <b>-vo</b> marque le conditionnel ; <b>-ko</b> pose la question, après le verbe. <b>lano</b> = ma/mon, <b>rae</b> = sa/son. Les adjectifs se placent <b>avant</b> le nom (<i>varo-mona</i> = grande monnaie). Un mot peut changer de terminaison sans changer de sens (funizi, funiza, funizo, funizu) : c’est pour que ça sonne bien à l’oreille.",
"Les terminaisons peuvent varier sans changer le sens. Exemples : <i>pre-daroke</i> (a donné), <i>fu-sagйe</i> (saura). À l’oral, <i>daroke</i> peut devenir <i>droké</i>.",
"Les mots de politesse et de tous les jours.",
"L’adjectif se place toujours avant le nom.",
"Des phrases entières pour voir tout ça en action."
];
export const PRON=`<b>Prononciation.</b> La lettre <b>n</b> se prononce comme un H aspiré : <i>ena</i> se dit « eha », <i>lano</i> se dit « laho ». La lettre <b>n</b> est le vrai N : <i>йasamora</i>, <i>bambiйo</i>, <i>pokoselйar</i>, <i>saë</i>.`;

export const RAW=`ena|moi / je|0
sivo|toi / tu|0
narai|il / elle / on|0
josu|nous|0
vosu|vous|0
lorai|ils / elles|0
oйi|il/lui|0
oйa|elle|0
etze|tout|1
sha-etze|rien|1
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
su|sur|1
eda|et|1
odia|ou|1
thoda|mais|1
poniv|parce que|1
zebo|pour|1
skoro bi|étant donné que|1
bardio|grâce à|1
йa|le / la|1
vi|oui / vrai / bien / bon|1
roloza|bien/super/génial|1
eh|quoi|1
saй|ça / ce / cette / cet|1
lazo|pourquoi|1
seran|certains|1
durama|durant/pendant|1
ilie|être|2
lio|avoir|2
saroke|venir|2
rola|rouler|2
varoka|aller|2
sumйo|douter|2
besara|embrasser|2
agйo|voir|2
lagйa|entendre|2
loroke|faire / travailler|2
sagйe|savoir|2
i|être (diminutif)|2
sogno|personne|2
kanora (kenara)|comprendre / pouvoir|2
devora|devoir|2
йameй|prendre|2
maha|acheter|2
catya|couper|2
sela|vendre|2
daroke|donner|2
amora|aimer|2
manka|manquer|2
yono|empêcher|2
spozi|parler|2
kala|appeler|2
rigйa|diriger|2
funizi|devenir|2
kuye|dire|2
selore|dire|2
malo|penser|2
dormara|se reposer|2
lamado|puer|2
йajai|Elle/Il/Lui|2
siyatura|signature|2
hesidare|hésiter|2
tsushima|dominer|2
yusso|apprendre|2
delora|vouloir|2
credo|croire|2
zhoyama|bonjour|3
viwansaj|bonsoir|3
kaska|chapeau|3
йameй kaska|prendre son chapeau = féliciter|3
vayara sola pazo|bonne nuit|3
aleksi|aller au ski|3
sola|soleil|3
braйdol|bêtise|3
emiat|intelligent|3
kilderic|vaillant|3
pazo|paix|3
langйo|langue|3
anapi|amour pur, dévoué|3
flezano|coup de foudre|3
pajol|l'avare|3
visйa|verre|3
veirdo|bizarre|3
йas|en|3
curoy|discipline|3
voй|eau|3
voйona|vodka|3
vayara|résultat|3
йasamora|au revoir|3
chi|merci|3
selami|s’il te plaît|3
ehisarok|bienvenue|3
vrayama|vraiment|3
йuna|maintenant|3
zolo|seul|3
orioй|heureux|3
poko|un peu/petit|3
sali-vuro|à lui|3
fali|facile|3
chamo|sympa|3
mona|argent / monnaie|4
varo|grand|4
morila|tristesse|4
loyu|la loi|4
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
gйozo|homme|4
bambiйo|bébé|4
ami|ami|4
pi|pied|4
cavu|fesses|4
paffo|zizi|4
pokoselйar|micronation|4
selйar|pays|4
fraйzi|français|4
bela|beau / belle|4
spezo|spécial|4
deziro|désiré|4
puto|pute|4
gabei|pardon|4
zald|fils|4
shapagйa|impossible / pas permi|4
ena amora siva|je t’aime|5
azkhazes|se frotter le mégatron|5
ena amora-sha siva|je ne t’aime pas|5
ena amora-ko siva ?|je t’aime ?|5
siva maйka lano|tu me manques|5
siva kora ilie bela bela|son cœur est magnifique|5
ena kala Sacha|je m’appelle Sacha|5
siva kanora-ko ?|comprends-tu ?|5
ena spozi vi|je parle bien|5
ena ilie sogno|je suis une personne|5
siva ilie ami|tu es un ami|5
narai ilie kilderic|il / elle est vaillant(e)|5
josu ilie йa fozel|nous sommes le peuple|5
vosu ilie bela|vous êtes beaux / belles|5
lorai ilie zolo|ils / elles sont seuls / seules|5
ena lio ami|j'ai un ami|5
siva lio bela kora|tu as un beau cœur|5
narai lio mona|il / elle a de l'argent|5
josu lio йa pazo|nous avons la paix|5
ena agйo йa luna|je vois la lune|5
siva agйo йa sola|tu vois le soleil|5
fela agйo йa luna|le chat voit la lune|5
йa bambiйo dormara|le bébé se repose|5
josu lagйa siva|nous t'entendons|5
vosu kanora ena|vous me comprenez|5
lorai spozi йa fraйzi|ils / elles parlent le français|5
ena yusso langйo|j'apprends une langue|5
narai loroke|il / elle travaille|5
josu dormara|nous nous reposons|5
ena delora pazo|je veux la paix|5
siva credo ena|tu me crois|5
siva agйo-ko luna ?|vois-tu la lune ?|5
vosu kanora-ko saй ?|comprenez-vous cela ?|5
narai lio-ko mona ?|a-t-il ou a-t-elle de l'argent ?|5
siva delora eh-ko ?|que veux-tu ?|5
vosu varoka-ko ?|allez-vous ?|5
ena pre-agйo йa luna|j'ai vu la lune|5
siva pre-saroke|tu es venu(e)|5
ena pre-daroke siva mona|je t'ai donné de l'argent|5
josu fu-saroke|nous viendrons|5
vosu fu-sagйe|vous saurez|5
lorai fu-kanora saй|ils / elles comprendront cela|5
ena fu-spozi йa fraйzi|je parlerai le français|5
narai fu-loroke|il / elle travaillera|5
ena ve-maha saй|j'achèterais cela|5
siva ve-saroke|tu viendrais|5
josu ve-dormara|nous nous reposerions|5
ena kanora-sha siva|je ne te comprends pas|5
siva delora-sha mona|tu ne veux pas d'argent|5
narai credo-sha ena|il / elle ne me croit pas|5
josu hesidare-sha|nous n'hésitons pas|5
lano fela ilie bela|mon chat est beau|5
rae ami ilie kilderic|son ami est vaillant|5
йa bela luna ilie spezo|la belle lune est spéciale|5
йa varo selйar ilie bela|le grand pays est beau|5
saй fela ilie bela|ce chat est beau|5
ena amora lano fela|j'aime mon chat|5
ena funizi kilderic|je deviens vaillant(e)|5
siva funiza kilderic|tu deviens vaillant(e)|5
narai funizo zolo|il / elle devient seul(e)|5
josu funizu ami|nous devenons amis|5
vosu spozi-ko ?|vous parlez ?|5
siva amora eh-ko ?|tu aimes quoi ?|5
Ena yusso o kenara sivo йas soй langйo|J'apprend à te comprendre dans ta langue|5
saй eh saй-ko ?|c’est quoi ça ?|5
saй ilie lano fozel|ça, c’est mon peuple|5
thoda ena malo malo ena|mais je pense par moi-même|5
ena fu-saroke nuna, devora sha hesidare|je viens maintenant, pas besoin d’hésiter|5
narai pre-daroke sivo mona, thodo siva pre-vramdra sha|il t’a donné ton argent, mais tu ne l’as pas pris|5
dia zolo fu-sagйe|dieu seul saura|5
ena ve-sela zebo saй|je vendrais pour ceci|5
ena tsushima sivo|je te domine|5
zhoyama, ena kala Sacha|bonjour, je m'appelle Sacha|5
zhoyama, lano ami|salut, mon ami|5
chi, siva ilie kilderic|merci, tu es vaillant(e)|5
vayara solo pazo, lano fela|bonne nuit, mon chat|5
siva kala-ko eh ?|comment t'appelles-tu ?|5
narai kala-ko eh ?|comment s'appelle-t-il / elle ?|5
ena yusso йa Galme|j'apprends le galme|5
siva yusso-ko йa Galme ?|apprends-tu le galme ?|5
josu yusso saй langйo|nous apprenons cette langue|5
lorai spozi-sha йa Galme|ils / elles ne parlent pas galme|5
ena spozi йa Galme, thoda poko|je parle galme, mais un peu|5
siva spozi vi йa Galme|tu parles bien galme|5
narai spozi vi vi|il / elle parle très bien|5
ena kanora siva, thoda poko|je te comprends, mais un peu|5
vosu kanora-sha ena|vous ne me comprenez pas|5
ena lagйa-sha siva|je ne t'entends pas|5
siva lagйa-ko ena ?|m'entends-tu ?|5
ena agйo йa sola, siva agйo йa luna|je vois le soleil, tu vois la lune|5
йa sola ilie varo|le soleil est grand|5
йa luna ilie bela bela|la lune est très belle|5
saй selйar ilie varo|ce pays est grand|5
lano selйar ilie bela|mon pays est beau|5
rae fela ilie zolo|son chat est seul|5
lano bambiйo dormara|mon bébé se repose|5
rae bambiйo ilie bela bela|son bébé est très beau|5
fela agйo йa bambiйo|le chat voit le bébé|5
ena amora lano fozel|j'aime mon peuple|5
josu amora lanoslo selйar|nous aimons notre pays|5
siva amora-ko lano fela ?|aimes-tu mon chat ?|5
narai amora-sha mona|il / elle n'aime pas l'argent|5
ena lio pazo, thoda lio-sha mona|j'ai la paix, mais je n'ai pas d'argent|5
siva lio-ko ami ?|as-tu un ami ?|5
josu lio varo kora|nous avons un grand cœur|5
ena manka siva|tu me manques|5
siva manka-ko ena ?|est-ce que je te manque ?|5
ena delora saй|je veux cela|5
siva delora-ko pazo ?|veux-tu la paix ?|5
josu delora pazo, thoda lorai delora mona|nous voulons la paix, mais ils / elles veulent l'argent|5
ena credo siva, thoda narai credo-sha|je te crois, mais il / elle ne croit pas|5
vosu credo-ko ena ?|me croyez-vous ?|5
ena loroke йuna|je travaille maintenant|5
siva loroke-ko йuna ?|travailles-tu maintenant ?|5
narai loroke-sha, narai dormara|il / elle ne travaille pas, il / elle se repose|5
josu pre-loroke, йuna josu dormara|nous avons travaillé, maintenant nous nous reposons|5
ena pre-yusso йa Galme|j'ai appris le galme|5
siva pre-spozi-ko йa Galme ?|as-tu parlé galme ?|5
lorai pre-saroke|ils / elles sont venu(e)s|5
narai pre-maha fela|il / elle a acheté un chat|5
san ilie sha fali ilie curoy|ça m'est facile d'être discipliné|5
josu pre-agйo йa luna|nous avons vu la lune|5
vosu pre-kanora-ko saй ?|avez-vous compris cela ?|5
ena fu-yusso saй langйo|j'apprendrai cette langue|5
siva fu-spozi vi йa Galme|tu parleras bien galme|5
narai fu-maha mona|il / elle achètera de l'argent|5
josu fu-agйo йa sola|nous verrons le soleil|5
lorai fu-saroke-ko ?|viendront-ils / elles ?|5
ena fu-daroke siva lano kora|je te donnerai mon cœur|5
ena ve-saroke, thoda ena loroke|je viendrais, mais je travaille|5
siva ve-kanora saй|tu comprendrais cela|5
narai saroke-vo|il / elle viendrait|5
josu maha-vo fela|nous achèterions un chat|5
ena ve-daroke siva mona|je te donnerais de l'argent|5
siva ve-amora-ko ena ?|m'aimerais-tu ?|5
ena hesidare, thoda siva hesidare-sha|j'hésite, mais tu n'hésites pas|5
ena funizi ami|je deviens un ami|5
narai funiza bela|il / elle devient beau / belle|5
lorai funizo fozel|ils / elles deviennent un peuple|5
siva funizu-ko kilderic ?|deviens-tu vaillant(e) ?|5
ena sagno bi siva i-veirdo|je sais que tu es bizarre|5
ena pre-funizi zolo|je suis devenu(e) seul(e)|5
josu fu-funizi varo fozel|nous deviendrons un grand peuple|5
йasamora, lano ami|au revoir, mon ami|5
ena pre-saroke, ena pre-agño, ena pre-tsushima|Veni Vidi Vici|5
ena malo o ena ilie|je pense donc je suis|5
siva kanora siva|connais toi toi-même|5
anapi agйo-sha|l'amour rend aveugle|5
ñameñ ña dia|Carpe Diem|5
ilie-ko odia ilie-sha-ko ?|être ou ne pas être|5
ña pazo ilie o vosu|la paix est avec vous|5
ena sagйe bi ena sagйe-sha|je sais que je ne sais rien|5
ena poko spozi йa Galme, thoda, ena vi spozi йa fraйzi|je parle un peu le galme, mais je parle bien le français|5`;
export const TD:string[]=["Pronom","Particule","Verbe","Expression","Nom","Phrase"];
export const TX:Record<string,string>={curoy:"Nom",emiat:"Adjectif",chamo:"Adjectif",fali:"Adjectif",orioй:"Adjectif",veirdo:"Adjectif",kilderic:"Adjectif",braйdol:"Nom",langйo:"Nom",anapi:"Nom",flezano:"Nom",aleksi:"Expression",siyatura:"Nom",vi:"Adverbe",roloza:"Adverbe",eh:"Pronom",poniv:"Particule",delora:"Verbe",credo:"Verbe",kaska:"Nom",pajol:"Nom",visйa:"Nom",йas:"Particule","йameй kaska":"Expression",voй:"Nom",voйona:"Nom",morila:"Nom",gabei:"Expression",saй:"Pronom",lazo:"Adverbe",seran:"Pronom",sogno:"Nom",йajai:"Pronom",sola:"Nom",pazo:"Nom",vayara:"Nom",vrayama:"Adverbe",nuna:"Adverbe",zolo:"Adjectif",poko:"Adverbe","sali-vuro":"Pronom",varo:"Adjectif",bela:"Adjectif",spezo:"Adjectif",deziro:"Adjectif",shapagйa:"Adjectif",fraйzi:"Adjectif"};
export const TO:string[]=["Pronom","Verbe","Nom","Adjectif","Adverbe","Particule","Expression","Phrase"];
export const TT:Record<string,string>={Pronom:"Pronoms",Verbe:"Verbes",Nom:"Noms",Adjectif:"Adjectifs",Adverbe:"Adverbes",Particule:"Particules et petits mots",Expression:"Expressions",Phrase:"Phrases"};
