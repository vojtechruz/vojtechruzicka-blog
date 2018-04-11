Organizace OWASP vydala novou verzi deseti nejnebezpečnějších zranitelností webových aplikací. O jaké zranitelnosti se jedná a co se změnilo od minulé verze? Jsou Vaše aplikace zranitelné?

Co je to OWASP?
--------------
OWASP je zkratka pro Open Web Application Security Project. Spíše než o projekt se ale jedná o neziskovou organizaci zaměřenou na zvyšování bezpečnosti aplikací, rozšiřování povědomí o bezpečnostních rizikách a poskytování nástrojů k minimalizaci těchto rizik. Pod OWASP spadá [množství projektů](https://www.owasp.org/index.php/Category:OWASP_Project) zaměřených na různé oblasti. Například OWASP Application [Security Verification Standard Project](https://www.owasp.org/index.php/Category:OWASP_Application_Security_Verification_Standard_Project), [OWASP Testing Guide](https://www.owasp.org/index.php/OWASP_Testing_Project) nebo [OWASP Dependency-Check](https://www.vojtechruzicka.com/detecting-dependencies-known-vulnerabilities/).

OWASP Top 10
-------------
I když OWASP zastřešuje mnoství projektů, jeden z nich je mnohem známější, než ty ostatní. Je to OWASP Top 10, seznam deseti nejkritičtějších zranitelností webových aplikací. Není to podrobná příručka (k tomu slouží jiné projekty OWASPu), ale poměrně krátký dokument, kde každé zranitelnosti je věnována pouhá jedna stránka. Účelem tedy není poskytnout vyčerpávající popis toho, jak zranitelnosti řešit a jak jim předcházet. Jde spíše o to zvýšit obecné povědomí o bezpečnostních rizicích při tvorbě webových aplikací. Jednoduchý a stručný přehled, který se hodí k získání obecného povědomí, ideální místo kde začít, pokud máte zájem začít brát bezpečnost Vašich aplikací vážně. A samozřejmě také srozumitelný dokument pro management, který se hodí při přesvědčování, že je třeba věnovat také nějaké prostředky k zabezpečení aplikace, že nestačí jenbusinessové funkce.

OWASP Top 10 je vydáván pravidelně každých několik let. Nejnovější verze byla vydána v prosinci 2017. Předchozí pak v letech 2013, 2010 a 2007.

Top 10 2017, pokus první
-------------------------------

[První pokus](https://www.owasp.org/images/3/3c/OWASP_Top_10_-_2017_Release_Candidate1_English.pdf) o vydání OWASP Top 10 2017 proběhl v dubnu téhož roku. Už první Release Candidate se však stal terčem [všeobecné kritiky](https://danielmiessler.com/blog/comments-owasp-top-10-2017-draft/) a vydání bylo odloženo. Co bylo špatně?

Změny oproti verzi 2013 byly ve zkratce"
- Jedna položka odstraněna
- Dvě podobné položky sloučeny
- Dvě nové položky přidány 

Hlavní problém byl právě s nově přidanými položkami.

1. Nedostatečná ochrana proti útokům
2. Nezabezpečené API

Narozdíl od ostatních osmi položek, tyto dvě nebyly zařazeny do seznamu na základě stejné metodiky jako ty ostatní. Tedy místo toho, aby byly přidány na základě nasbíraných dat, byly přidány pouze na základě uvážení autorů. Tím se Top 10 stal nesourodou směsí, kde různé položky byly přidávány na základě různých přístupů - některé byly podloženy daty, jiné ne. Přitom nebylo na první pohled zřejmé, které byly přidány jakým způsobem. Aby toho nebylo málo, nestrannost projektu [byla zpochybňována](https://medium.com/@JoshCGrossman/behind-the-the-owasp-top-10-2017-rc1-df43236f79ff), protože jedna z položek byla přidána na základě návrhu předloženéhokomerční společností, za který se postavila jen a pouze tato společnost. Shodou okolností se tatáž společnost zabývá prodejem produktu, který danou zranitelnost přímo řeší. A co víc, tento produk byl přímo zmíněn v Top 10 dokumentu. Náhoda?

Další problém byl s rozdílnou granularitou zranitelností. Vedle specifických problémů jako je Cross Site Scripting jsou najednou zcela obecné položky jako je "Nedostatečná ochrana proti útokům". Úroveň detailu jednotlivých položek je tedy zcela nekonzistetní.

Top Ten 2017, pokus druhý
----------------------

Kritiku první verze nebral OWASP na lehkou váhu a rozhodl se učinit řadu změn. Prvním zásadním krokem byla obměna vedení. Pak metodiky. A transparentnost především. Vše je nyní veřejně na [GitHubu](https://github.com/OWASP/Top10) - Dokument samotný, zpětná vazba, úkoly i [nasbíraná data](https://github.com/OWASP/Top10/tree/master/2017/datacall), na základě kterých jsou položky do seznamu zahrnuty. Už žádné další informace pohřbené v historii diskuzí v mailing listech.

Dle nové metodiky se nyní osm z deseti položek určuje na základě dat o zranitelnostech nasbíraných od mnoha růzých společností a aplikací. Zbylé dvě položky se zařazují na základě veřejné ankety mezi členy komunity. Díky tomu Top 10 obsahuje jak položky reflektující reálná data ze současných aplikací, tak názor odborné veřejnosti, na základě kterého se zařadí i nové zranitelnosti, které zatím nejsou sice široce rozšířeny, ale znamenají hrozbu do budoucnosti. Seznam se pece jen aktualizuje pouze jednou za několik let. Určování pořadí položek se také změnilo, nyní je pouze na základě rizikovosti dané zranitelnosti.

Po předchozím neúspěchu v dubnu, zbrusu nová verze byla konečně zveřejněna v prosinci. Obsahuje následujících deset položek:

  Položka                                             | Popis
  -------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  1\. Injection                                    | Injection flaws, such as SQL injection, occur when untrusted data is sent to an interpreter as part of a command or query. It can trick the interpreter into executing unintended commands or accessing data.
  2\. Broken Authentication                        | Application functions related to authentication and session management are often implemented incorrectly, allowing attackers to assume other users' identities.
  3\. Sensitive Data Exposure                      | Many web applications and APIs do not properly protect sensitive data. Attackers may steal or modify such weakly protected data. Sensitive data may be compromised without extra protection, such as encryption at rest or in transit.
  4\. XML External Entities (XXE)                  | External entities in XML can be used to disclose internal files, remote code execution or DDoS attacks.
  5\. Broken Access Control                        | Attackers can exploit access restriction flaws to access unauthorized functionality and data.
  6\. Security Misconfiguration                    | Use of insecure default configurations, incomplete or ad hoc configurations, open cloud storage, misconfigured HTTP headers, and verbose error messages containing sensitive information.
  7\. Cross-Site Scripting (XSS)                   | Applications use unsanitized user-supplied data in a web page. It allows execution of scripts in the victim's browser.
  8\. Insecure Deserialization                     | Insecure deserialization often leads to remote code execution, replay attacks, injection attacks, and privilege escalation attacks.
  9\. Using Components with Known Vulnerabilities  | Components, such as libraries, frameworks run with the same privileges as the application. Components with known vulnerabilities may undermine application defenses.
  10\. Insufficient Logging & Monitoring           | Insufficient logging and monitoring, with missing incident response, prevents rapid reaction and allows continuous probing for vulnerabilities.

Co se změnilo
------------

#### Cross-side request forgery odstraněno

CSRF je typ útoku, kdy jsou jménem přihlášeného uživatele vykonány nechtěné akce.

Jedna z nejznámějších zranitelností vůbec a evergreenv OWASP Top Ten. Odtranění této položky je zásadní krok a historický moment. V době, kdy byla poprvé zařazena do tohoto senzmau, jednalo se o novou a prakticky neznámou hrozbu. Od té doby se naštěstí lecos změnilo a jedná se o dobře známou zranitelnost a řada frameworků ji řeší ve výchozím nastavení, tím, že posílá speciální CSRF token. Řada aplikací je tedy zabezpečena a to i v případě, že vývojáři nemají ani páru o tom, co to CSRF je. Podle posledního průzkumu OWASP bylo ohroženo pouze asi 5% aplikací, což je oproti dřívějšímu stavu obrovský úspěch. CSRF tedy uvolnilo své místo v seznamu jiným zranitelnostem.


#### Nezabecnečené přesměrování odstraněno

Tato zranitelnost využívala nezabezpečených přesměrování v aplikacích (redirect a froward) k tomu, aby z důvěryhodné stránky přesměrovala nic netušícího uživatele na stránku škodlivou.

Zranitelnost je obsažena v osmi procentech analyzovaných aplikací, ale ze seznamu byla vytlačena zranitelností XXE.

#### Sloučeno: Přímé odkazy na objekty a chybějící kontrola přístupu na úrovni funkcí

Tyto dvě položky už nejsou nadále samostatné a byly sloučeny do jedné - Nefunkční kontrola přístupu.

#### Nová položka: XML External Entities

Jediná nově zařazená položka, která byla zahrnuta na základě nasbíraných dat a ne komunitní ankety.

Problém s touto zranitelností spočívá v tom, že na rozdíl od Cross Site Scripting nebo Cross Site Request Forgery je málo známá. Velká část dnešních bezpečnostních testů ji neberou v úvahu. Přitom dopad jejího zneužití může být velmi závažný.

XXE je typem zranitelnosti při zpracování XML pomocí zastaralých nebo špatně konfigurovaných procesorů. Konkrétní zneužití může mít mnoho podobvčetně Denial of Service, skenování portů nebo úniku citlivých dat. K zmírnění rizika této zranitelnosti je nutné použít nové verze XML procesorů a pokud to není nebzbytně nutné, tak vypnout zpracování externích entit. A zvážit jestli v daném případě je formát XML nutný, nebo zda postačí jiný formát, jako třeba JSON. Bohužel zpracování externích XML entit je zpravidla povoleno ve výchozím nastavení a je třeba jej explicitně zakázat. Zvažte také valdiaci XML na straně serveru optoti whitelistu možných hodnot, pokud se použití externích XML entit nelze vyhnout. Více detailů poskytje [OWASP XXE Prevention cheat-sheet](https://www.owasp.org/index.php/XML_External_Entity_(XXE)_Prevention_Cheat_Sheet).

#### Nová položka: Nedostatečné logování a monitorování

Tato nová položka byla zařazena na základě veřejné ankety a ne na základě nasbíraných dat. Položky určené anketou jsou zahrnuty vůbec poprvé ve verzi 2017.

Aby byl útočník schopen využít zranitelnosti v aplikaci k úspěšnému útoku, musí o ní nejdříve vědět. Proto většinou útoku předchází "oťukávání" aplikace a hledání běžných zranitelností. Každá, sebelépe zabezpečená, aplikace obsahuje nějaku zranitelnost a je jen otázkou času a vynaloženého úsilí ji najít. Pokud aplikace nepoksytuje žádný způsob jak takové pokusy odhalit, útočník má volné pole působnosti. 

Aplikace by měla poskytnout nejem možnost odhalit takové pokusy, ale hlavně by měla poskytnout mechanismus, který detekuje, že došlo k úspěšnému prolomení. Pokud je takový mechanismus automatizovaný, umožňuje to rychle reagovat a minimalizovat škody. Bohužel, často k odhalení úspěšného útoku dojde až pozdě nebo vůbec. Průměrně to trvá [191 dní](https://www-01.ibm.com/common/ssi/cgi-bin/ssialias?htmlfid=SEL03130WWEN&), což útočníkovi poskytuje spoustu času.

Tato zranitelnost je důležitá hlavně kvůli tomu, že dává útočníkovi svobodu a čas zneužít Vaše ostatní zranitelnosti a znemožňuje rychlou reakci na útok a prevenci dalších škod. Ujistěte se, že nezanedbáváte logování a že logy jsou snadno přístupné. Vyplatí se mít automatické notifikace v případě nestandardního chování. OWASP poskytuje [příručku](https://www.owasp.org/index.php/OWASP_Proactive_Controls#8:_Implement_Logging_and_Intrusion_Detection) na toto téma a [AppSensor](https://www.owasp.org/index.php/OWASP_AppSensor_Project), což je konceptuální rámec a metodologie, jak implementovat detekci narušení a automatickou reakci na něj.

#### Nová položka: Nezabezpečená Deserializace

Toto je druhá položka zařazená na základě komunitní ankety. Zranitelnosti v deserializaci jsou sice na jednu stranu poměrně tězko zjistitelné a zneužitelné, ale na druhou stranu mohou mít velmi závažné následky.

An application is vulnerable when accepting serialized objects (note that this does not apply only to java serialization but the process in general) from external sources. If a malicious serialized object is provided, it can lead to unexpected behavior such as remote code execution or complete system takeover. This does not apply only to inter-system communication, where serialization is involved, but also in situations such as caching.

The only robust protection is to use serialization solutions, where only primitive data types are allowed. If that is not possible, there are some ways to mitigate the risk such as

-   Logging all unexpected serialization inputs with automatic notifications to have early warning.
-   Deserialization modules should run with the least privileges possible.
-   Integrity checks of serialized objects to prevent data tampering

  ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  2013                                                                                                       |2017
  -----------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------
  1\. Injection                                                                                              | 1\. Injection
  2\. Broken Authentication and Session Management                                                           | 2\. Broken Authentication
  3\. Cross-Site Scripting                                                                                   | 3\. Sensitive Data Exposure
  4\. Insecure Direct Object References **(Merged with 7)**                                                  | 4\. XML External Entities **(NEW)**
  5\. Security Misconfiguration                                                                              | 5\. Broken Access Control **(Merged 4+7)**
  6\. Sensitive Data Exposure                                                                                | 6\. Security Misconfiguration
  7\. Missing Function Level Access Control **(Merged with 4)**                                              | 7\. Cross-Site Scripting
  8\. Cross-Site Request Forgery **(Removed)**                                                               | 8\. Insecure Deserialization **(NEW, Community)**
  9\. Using Components with Known Vulnerabilities                                                            | 9\. Using Components with Known Vulnerabilities
  10\. Unvalidated Redirects and Forwards **(Removed)**                                                      | 10\. Insufficient Logging & Monitoring **(NEW, Community)**
  ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

More From OWASP
---------------

Okay, you are now familiar with OWASP Top Ten. You've read the document back and forth. You are now zealously making sure your apps are as safe as possible. What's next?

First of all, you should realize, that Top Ten is just a tip of the iceberg. You shouldn't definitely stop at 10. There are many, many more vulnerabilities and risks to look for. While top ten is good in raising awareness, it is by no means \'Security Bible\'. For detailed guides and explanations, you'll have to look elsewhere. But where to start? With other OWASP projects, of course!

Some of the interesting projects are:

-   [OWASP Developer Guide](https://www.owasp.org/index.php/OWASP_Guide_Project)
-   [OWASP Testing Guide](https://www.owasp.org/index.php/OWASP_Testing_Project)
-   [OWASP Cheat Sheets](https://www.owasp.org/index.php/OWASP_Cheat_Sheet_Series)
-   [OWASP Code Review Guide](https://www.owasp.org/index.php/Category:OWASP_Code_Review_Project)

One more thing worth mentioning is that Top Ten is not suitable for a security verification checklist due to its limited scope. Turns out there is a better match -- an OWASP project specifically focused on this area - [OWASP Application Security Verification Standard Project](https://www.owasp.org/index.php/Category:OWASP_Application_Security_Verification_Standard_Project).
