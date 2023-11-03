Text vyšel původně na [autorově blogu](https://www.vojtechruzicka.com/owasp-top-ten-2017/).

Organizace OWASP vydala novou verzi deseti nejnebezpečnějších zranitelností webových aplikací. O jaké zranitelnosti se jedná a co se změnilo od minulé verze? Jsou Vaše aplikace zranitelné?

Co je to OWASP?
--------------
OWASP je zkratka pro Open Web Application Security Project. Spíše než o projekt se ale jedná o neziskovou organizaci zaměřenou na zvyšování bezpečnosti aplikací, rozšiřování povědomí o bezpečnostních rizicích a poskytování nástrojů k jejich minimalizaci. Pod OWASP spadá [množství projektů](https://www.owasp.org/index.php/Category:OWASP_Project) zaměřených na různé oblasti. Například OWASP Application [Security Verification Standard Project](https://www.owasp.org/index.php/Category:OWASP_Application_Security_Verification_Standard_Project), [OWASP Testing Guide](https://www.owasp.org/index.php/OWASP_Testing_Project) nebo [OWASP Dependency-Check](https://www.vojtechruzicka.com/detecting-dependencies-known-vulnerabilities/).

OWASP Top 10
-------------
I když OWASP zastřešuje mnoho projektů, jeden z nich je mnohem známější, než ty ostatní. Je to OWASP Top 10, seznam deseti nejkritičtějších zranitelností webových aplikací. Není to podrobná příručka (k tomu slouží jiné projekty OWASPu), ale poměrně krátký dokument, kde každé zranitelnosti je věnována pouhá jedna stránka. Účelem tedy není poskytnout vyčerpávající popis toho, jak zranitelnosti řešit a jak jim předcházet. Jde spíše o to zvýšit obecné povědomí o bezpečnostních rizicích při tvorbě webových aplikací. Jednoduchý a stručný přehled, který se hodí k získání obecného povědomí, ideální místo kde začít, pokud chcete začít brát bezpečnost Vašich aplikací vážně. A samozřejmě také srozumitelný dokument pro management. To se hodí při přesvědčování, že je třeba věnovat také nějaké prostředky k zabezpečení aplikace, že nestačí jen businessové funkce.

OWASP Top 10 je vydáván pravidelně každých několik let. Nejnovější verze byla vydána v prosinci 2017. Předchozí pak v letech 2013, 2010 a 2007.

Top 10 2017, pokus první
-------------------------------

[První pokus](https://www.owasp.org/images/3/3c/OWASP_Top_10_-_2017_Release_Candidate1_English.pdf) o vydání OWASP Top 10 2017 proběhl v dubnu téhož roku. Už Release Candidate se však stal terčem [všeobecné kritiky](https://danielmiessler.com/blog/comments-owasp-top-10-2017-draft/) a vydání bylo odloženo. Co bylo špatně?

Změny oproti verzi 2013 byly ve zkratce:
- Jedna položka odstraněna
- Dvě podobné položky sloučeny
- Dvě nové položky přidány 

Hlavní problém byl právě s nově přidanými položkami.

1. Nedostatečná ochrana proti útokům
2. Nezabezpečené API

Na rozdíl od ostatních osmi položek, tyto dvě nebyly zařazeny do seznamu na základě stejné metodiky jako ty ostatní. Tedy místo toho, aby byly zvoleny na základě nasbíraných dat, byly přidány pouze na základě uvážení autorů. Tím se Top 10 stal nesourodou směsí, kde různé položky byly přidávány na základě různých přístupů - některé byly podloženy daty, jiné ne. Přitom nebylo na první pohled zřejmé, které byly přidány jakým způsobem. Aby toho nebylo málo, nestrannost projektu [byla zpochybňována](https://medium.com/@JoshCGrossman/behind-the-the-owasp-top-10-2017-rc1-df43236f79ff), protože jedna z položek byla zařazena na základě návrhu předloženého komerční společností, za který se postavila jen a pouze tato společnost. Shodou okolností se tatáž společnost zabývá prodejem produktu, který danou zranitelnost přímo řeší. A co víc, tento produkt byl přímo zmíněn v Top 10 dokumentu. Náhoda?

Další problém byl s rozdílnou granularitou zranitelností. Vedle specifických problémů jako je Cross Site Scripting jsou najednou zcela obecné položky jako je "Nedostatečná ochrana proti útokům". Úroveň detailu jednotlivých zranitelností byla tedy zcela nekonzistetní.

Top Ten 2017, pokus druhý
----------------------

Kritiku první verze nebral OWASP na lehkou váhu a rozhodl se učinit řadu změn. Prvním zásadním krokem byla obměna vedení, následně metodiky. A transparentnost především - vše je nyní veřejně na [GitHubu](https://github.com/OWASP/Top10) - dokument samotný, zpětná vazba, úkoly i [nasbíraná data](https://github.com/OWASP/Top10/tree/master/2017/datacall), na základě kterých jsou položky do seznamu zahrnuty. Už žádné další informace pohřbené v historii diskuzí v mailing listech.

Dle nové metodiky se nyní osm z deseti položek určuje na základě dat o zranitelnostech nasbíraných od mnoha růzých společností a aplikací. Zbylé dvě položky se zařazují na základě veřejné ankety mezi členy komunity. Díky tomu Top 10 obsahuje jak položky reflektující reálná data ze současných aplikací, tak názor odborné veřejnosti, na základě kterého se zařadí i nové zranitelnosti, které zatím nejsou sice široce rozšířeny, ale znamenají hrozbu do budoucnosti. Seznam se přece jen aktualizuje pouze jednou za několik let. Určování pořadí položek se také změnilo, nyní je pouze na základě rizikovosti dané zranitelnosti.

Po předchozím neúspěchu v dubnu byla konečně zveřejněna zbrusu nová verze v prosinci. Obsahuje následujících deset položek:

| Položka                                         | Popis                                                                                                                                                                                                             |
|-------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 1\. Injekce                                     | Zranitelnosti vsunutím škodlivého kódu jako např. SQL Injection. Nastává pokud neověřená data jsou použita v dotazu nebo příkazu a interpretována. Může vést k úniku a ztrátě dat nebo spuštění nežádoucího kódu. |
| 2\. Nefunkční autentizace                       | Autentizace je často implementována chybně nebo nedostatečně. Může vést k převzetí uživatelských účtů nebo celého systému.                                                                                        |
| 3\. Nezabezpečení citlivých dat                 | Nezabezpečený přenos a uchovávání citivých dat. Útočník může tato data změnit nebo zneužít k dalším útokům.                                                                                                       |
| 4\. XML External Entities (XXE)                 | Externí entity v XML mohou být zneužity k přístupu k chráněným souborům, spuštění škodlivého kódu nebo DDoS útokům.                                                                                               |
| 5\. Nefunkční kontrola přístupu                 | Útočník může využít chyb v kontrole přístupu, aby se dostal k citlivým datům a chráněným funkcím systému.                                                                                                         |
| 6\. Chybná konfigurace                          | Použití výchozí konfigurace, nekompletní konfigurace, detailní výpis chyb na klientovi, špatné HTTP hlavičky a další.                                                                                             |
| 7\. Cross-Site Scripting (XSS)                  | Pokud není sanitizován vstup od uživatele, může útočník spustit škodlivý javascriptový kód v prohlížeči oběti.                                                                                                    |
| 8\. Nezabezpečená Deserializace                 | Nezabezpečená deserializace může vést k řadě útoků včetně spuštění škodlivého kódu.                                                                                                                               |
| 9\. Použití komponent se známými zranitelnostmi | Útočník může využít zranitelnosti v komponentách a frameworcích třetích stran, zvláště pokud jsou použity neaktualizované verze se známými zranitelnostmi.                                                        |
| 10\. Nedostatečné logování a monitorování       | Nedostatečné logování a monitorování včetně chybějící automatické notifikace znemožňuje včasnou reakci na útoky a umožňuje útočníkům nerušeně hledat zranitelnosti v aplikaci.                                    |

Co se změnilo
------------

#### Cross-side request forgery odstraněno

CSRF je typ útoku, kdy jsou jménem přihlášeného uživatele vykonány nechtěné akce.

Jedna z nejznámějších zranitelností vůbec a evergreen v OWASP Top Ten. Odtranění této položky je zásadní krok a historický moment. V době, kdy byla poprvé zařazena do tohoto seznamu, jednalo se o novou a prakticky neznámou hrozbu. Od té doby se naštěstí mnoho změnilo a nyní jde o dobře známou zranitelnost. Řada frameworků ji řeší ve výchozím nastavení tím, že posílá speciální CSRF token. Mnoho aplikací je tedy zabezpečeno, a to i v případě, že vývojáři nemají ani páru o tom, co to CSRF je. Podle posledního průzkumu OWASP bylo ohroženo pouze asi 5% aplikací, což je oproti dřívějšímu stavu obrovský úspěch. CSRF tedy uvolnilo své místo v seznamu jiným zranitelnostem.


#### Nezabezpečené přesměrování odstraněno

Tato zranitelnost využívala nezabezpečených přesměrování v aplikacích (redirect a froward) k tomu, aby z důvěryhodné stránky přesměrovala nic netušícího uživatele na stránku škodlivou.

Zranitelnost je obsažena v osmi procentech analyzovaných aplikací, ale ze seznamu byla vytlačena zranitelností XXE.

#### Sloučeno: Přímé odkazy na objekty a chybějící kontrola přístupu na úrovni funkcí

Tyto dvě položky už nejsou nadále samostatné a byly sloučeny do jedné - Nefunkční kontrola přístupu.

#### Nová položka: XML External Entities

Jediná nově zařazená položka, která byla zahrnuta na základě nasbíraných dat a ne veřejného hlasování.

Problém s touto zranitelností spočívá v tom, že na rozdíl od Cross Site Scripting nebo Cross Site Request Forgery je málo známá. Velká část dnešních bezpečnostních testů ji neberou v úvahu. Přitom dopad jejího zneužití může být velmi závažný.

XXE je typem zranitelnosti při zpracování XML pomocí zastaralých nebo špatně konfigurovaných procesorů. Konkrétní zneužití může mít mnoho podob včetně Denial of Service, skenování portů nebo úniku citlivých dat. K zmírnění rizika této zranitelnosti je nutné použít nové verze XML procesorů a pokud to není nezbytně nutné, tak vypnout zpracování externích entit. A zvážit, jestli v daném případě je formát XML nezbytně nutný, zda nepostačí jiný formát, jako třeba JSON. Bohužel zpracování externích XML entit je zpravidla povoleno ve výchozím nastavení a je třeba jej explicitně zakázat. Zvažte také valdiaci XML na straně serveru oproti whitelistu možných hodnot, pokud se použití externích XML entit nelze vyhnout. Více detailů poskytuje [OWASP XXE Prevention cheat-sheet](https://www.owasp.org/index.php/XML_External_Entity_(XXE)_Prevention_Cheat_Sheet).

#### Nová položka: Nedostatečné logování a monitorování

Tato nová položka byla zařazena na základě veřejné ankety a ne na základě nasbíraných dat. Položky určené anketou jsou zahrnuty vůbec poprvé ve verzi 2017.

Aby byl útočník schopen využít zranitelnosti v aplikaci k úspěšnému útoku, musí o ní nejdříve vědět. Proto většinou útoku předchází "oťukávání" aplikace a hledání běžných zranitelností. Každá, sebelépe zabezpečená, aplikace obsahuje nějaku zranitelnost a je jen otázkou času a vynaloženého úsilí ji najít. Pokud aplikace neposkytuje žádný způsob jak takové pokusy odhalit, útočník má volné pole působnosti. 

Aplikace by měla poskytnout nejem možnost odhalit takové pokusy, ale hlavně by měla mít mechanismus, který detekuje, že došlo k úspěšnému prolomení. Pokud je takový mechanismus automatizovaný, umožňuje to rychle reagovat a minimalizovat škody. Bohužel, často k odhalení úspěšného útoku dojde až pozdě nebo vůbec. Průměrně to trvá [191 dní](https://www-01.ibm.com/common/ssi/cgi-bin/ssialias?htmlfid=SEL03130WWEN&), což útočníkovi poskytuje spoustu času.

Tato zranitelnost je důležitá hlavně kvůli tomu, že dává útočníkovi svobodu a čas zneužít Vaše ostatní zranitelnosti a znemožňuje rychlou reakci na útok a prevenci dalších škod. Ujistěte se, že nezanedbáváte logování. Vyplatí se mít automatické notifikace v případě nestandardního chování. OWASP poskytuje [příručku](https://www.owasp.org/index.php/OWASP_Proactive_Controls#8:_Implement_Logging_and_Intrusion_Detection) na toto téma a [AppSensor](https://www.owasp.org/index.php/OWASP_AppSensor_Project), což je konceptuální rámec a metodologie, jak implementovat detekci narušení a automatickou reakci na něj.

#### Nová položka: Nezabezpečená Deserializace

Toto je druhá položka zařazená na základě komunitní ankety. Zranitelnosti v deserializaci jsou sice na jednu stranu poměrně tězko zjistitelné a zneužitelné, ale na druhou stranu mohou mít velmi závažné následky.

Aplikace je zranitelná, pokud přijímá serializované objekty z externích zdrojů. Deserializace škodlivého objektu může mít různé následky, k nejzávažnějším pak patří vykonání škodlivého kódu poskytnutého útočníkem. To může vést až k získání plné kontroly nad systémem. Je důležité si uvědomit, že se nemusí jednat pouze o scénáře, kdy serizalizace je použita ke komunikaci mezi dvěma systémy. Je potřeba ji chápat v širším smyslu. Může se jednat tedy i o případy, kdy serializovaná reprezentace je používána jen jedním systémem lokálně, například při cachování.

Jedinou skutečně efektivní ochranou je používat serializaci pouze v případech, kdy jen primitivní datové typy jsou povoleny. Pokud to není možné, lze snížit riziko pomocí kroků jako například:

- Logování všech serializovaných vstupů s neočekávanými hodnotami včetně automatických notifikací. To umožní včasnou detekci útoku a následná protiopatření.
- Moduly pracující s deserializací by měly běžet s co možná nejmenšími právy a izolovaně.
- Kontrola integrity přijímaných objektů, aby se zamezilo manipulaci s nimi.

2013                                                                                                      |2017
----------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------
1\. Injekce                                                                                               | 1\. Injekce
2\. Nefunkční autentizace a správa sessions                                                               | 2\. Nefunkční autentizace
3\. Cross-Site Scripting                                                                                  | 3\. Nezabezpečení citlivých dat 
4\. Přímé odkazy na objekty **(Sloučeno s 7)**                                                            | 4\. XML External Entities **(Nové)**
5\. Chybná konfigurace                                                                                    | 5\. Nefunkční kontrola přístupu **(Sloučeno 4+7)**
6\. Nezabezpečení citlivých dat                                                                           | 6\. Chybná konfigurace
7\. Chybějící kontrola přístupu na úrovni funkcí **(Sloučeno s 4)**                                       | 7\. Cross-Site Scripting
8\. Cross-Site Request Forgery **(Odstraněno)**                                                           | 8\. Nezabezpečená Deserializace **(Nové, od komunity)**
9\. Použití komponent se známými zranitelnostmi                                                           |  9\. Použití komponent se známými zranitelnostmi
10\. Nezabezpečené přesměrování **(Odstraněno)**                                                          | 10\. Nedostatečné logování a monitorování **(Nové, od komunity)**
---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

Další projekty OWASP
---------------

OWASP Top 10 se hodí k získání základního povědomí o bezpečnosti webových aplikací, ale rozhodně nejde příliš do hloubky. Je třeba si uvědomit, že vybraných deset položek je pouze špička ledovce. Rozhodně nelze očekávat, že když pokryjete tyto zranitelnost, máte vyhráno. Zranitelností je nepřeberné množství a technik jak se jim bránit jakbysmet. Top 10 není bezpečnostní Biblí, není to vyčerpávající příručka o tom, jak zabezpečit Vaše aplikace. Pouze zvyšuje všeobecné povědomí o hrozbách. Po detailních návodech se musíte poohlížet jinde. Kde ale začít? Samozřejmě u ostatních projektů OWASPu. Těch je mnoho, ale pro začátek za zmínku stojí například:

-   [OWASP Příručka pro vývojáře](https://www.owasp.org/index.php/OWASP_Guide_Project)
-   [OWASP Příručka pro testery](https://www.owasp.org/index.php/OWASP_Testing_Project)
-   [OWASP Taháky](https://www.owasp.org/index.php/OWASP_Cheat_Sheet_Series)
-   [OWASP Příručka pro Code Review](https://www.owasp.org/index.php/Category:OWASP_Code_Review_Project)

Top 10 se může na první pohled zdát jako vhodný "checklist" ke kontrole Vaší aplikace, jestli jste nezapomněli na nějakou zásadní zranitelnost. Díky svému omezenému rozsahu ale pro tento účel není příliš vhodný. Naštestí OWASP zastřešuje projekt, který se na tuto problematiku přímo zaměřuje:
[OWASP Application Security Verification Standard Project](https://www.owasp.org/index.php/Category:OWASP_Application_Security_Verification_Standard_Project).
