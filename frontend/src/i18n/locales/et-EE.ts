const locale = {
  translation: {
    header: {
      language: "Keel",
      languageModalTitle: "Vali keel",
      languageModalDesc: "Vali kasutajaliidese keel, mida soovid kasutada.",
      agreement: "Kasutajaleping",
      privacy: "Privaatsuspoliitika",
      help: "Abikeskus",
      logout: "Logi välja",
      accountCenter: "Kontokeskus",
    },
    captcha: {
      securityVerification: "Turvalisuse kontroll",
      refresh: "Värskenda",
      imageCaptcha: "Pildi CAPTCHA",
      imageCaptchaRequired: "Sisestage pildi CAPTCHA",
    },
    legal: {
      back: "Tagasi avalehele",
      updatedAt: "Viimati uuendatud: {{date}}",
      agreement: {
        title: "Kasutajaleping",
        updatedAt: "2026-06-16",
        intro:
          "Tere tulemast {{siteName}}. Enne registreerimist, sisselogimist, integreerimist või ühtse identiteediteenuse kasutamist lugege see leping hoolikalt läbi. Teenuse kasutamise jätkamisega nõustute selle lepinguga.",
        sections: {
          accountTitle: "1. Konto ja sisselogimine",
          accountP1:
            "Peate esitama tõelised, seaduslikud ja kättesaadavad registreerimisandmed ning hoidma oma konto, parooli, kinnituskoodid ja muud volitused korralikult kaitstuna. Halva volituste haldamise tõttu tekkivad kahjud jäävad teie vastutusele.",
          accountP2:
            "Kui tuvastatakse ebanormaalne sisselogimistegevus, poliitikate rikkumine, külmutatud olek või turvariskid, võib platvorm nõuda täiendavat kinnitust, piirata sisselogimist või peatada juurdepääsu turvalisuse huvides.",
          acceptableUseTitle: "2. Aktsepteeritav kasutus",
          acceptableUseP1:
            "Te ei tohi seda süsteemi kasutada ebaseaduslikuks tegevuseks, õiguste rikkumiseks, autentimisliideste kuritarvitamiseks, massiliste päringute tegemiseks, volituste täitmiseks või platvormi stabiilsust ohustava või turvakontrollidest möödahiiliva käitumiseks.",
          acceptableUseP2:
            "Kui rikute seda lepingut või sellega seotud reegleid, võib platvorm peatada või lõpetada osa või kogu teie juurdepääsu ja jätab endale õiguse vajadusel vastutust nõuda.",
          authorizationTitle: "3. Autoriseerimine ja kolmandate osapoolte rakendused",
          authorizationP1:
            "Kui kasutate {{siteName}} kontot kolmanda osapoole rakendusse sisselogimiseks, küsib süsteem teie nõusolekut autoriseerimislehel kuvatavate õiguste põhjal. Võite keelduda või tühistada selle nõusoleku igal ajal kontokeskuses.",
          authorizationP2:
            "Kolmanda osapoole rakenduse poolt pärast autoriseerimist teie andmete kasutamist reguleerivad selle rakenduse enda teenusetingimused ja privaatsuspoliitika. Platvorm võtab vastutuse ainult seadusega nõutavas ulatuses.",
          developerTitle: "4. Arendaja integreerimine",
          developerP1:
            "Arendajad peavad tagama, et rakenduse teave, ümbersuunamise URI-d, taotletud ulatused ja ärieesmärgid oleksid tõelised, täielikud ja pidevalt kehtivad, ning ei tohi kasutajaid eksitada.",
          developerP2:
            "Platvorm võib ühendatud rakendusi üle vaadata, tagasi lükata, nimekirjast eemaldada, kustutada või piirata, et säilitada ühtse identiteedi ökosüsteemi turvalisus ja terviklikkus.",
          liabilityTitle: "5. Teenuse muudatused ja vastutuse piiramine",
          liabilityP1:
            "Turvalisuse, vastavuse, operatsiooniliste või hoolduslike põhjuste tõttu võib platvorm reguleerida, uuendada, peatada või lõpetada teatud liideseid, vooge või funktsioone ning püüab vajadusel teavitada.",
          liabilityP2:
            "Seadusega lubatud ulatuses ei vastuta platvorm seaduslike kohustuste ületavate katkestuste, ebanormaalsete andmete või kahjude eest, mis on põhjustatud jõud majeure'ist, võrguriketest, kolmandate osapoolte põhjustest või teie poolelt valest kasutusest.",
accountP3:
            "Kasutaja- ja arendajakontode kaitsmiseks võib platvorm teostada riskihindamisi stsenaariumides nagu parooliga sisselogimine, koodiga sisselogimine, passkey-ga sisselogimine, QR-koodiga sisselogimine, telefoninumbri sidumine, e-posti muutmine, telefoninumbri muutmine, parooli muutmine, MFA seadistamine, konto kustutamine, andmete eksport ja arendajarakenduste haldamine. Sõltuvalt tulemusest võib platvorm nõuda täiendavat kontrolli, töötlemist edasi lükata, toimingut piirata või juurdepääsu blokeerida.",
        },
      },
      privacy: {
        title: "Privaatsuspoliitika",
        updatedAt: "2026-06-16",
        intro:
          "{{siteName}} väärtustab teie isikuandmeid ja konto turvalisust. See poliitika selgitab, kuidas me teie teavet kogume, kasutame, säilitame, jagame ja kaitseme, samuti teile kättesaadavaid õigusi.",
        sections: {
          dataCollectionTitle: "1. Kogutav teave",
          dataCollectionP1:
            "Kui registreerite, logite sisse või kasutate kontoteenuseid, võime koguda teie registreerimisriigi, e-posti aadressi, telefoninumbri, parooli räsi, sisselogimissessioonide, seadme IP, autoriseerimiskirjete ja vajalike turvalogide teavet.",
          dataCollectionP2:
            "Kui laadite üles avatari, muudate profiili, sidute telefoninumbri, lubate MFA või autoriseerite kolmanda osapoole rakenduse, töötleme teie esitatud teavet vastavalt funktsiooni pakkumiseks vajalikule.",
dataCollectionP3:
            "Kontode ülevõtmise, credential stuffingu, ebanormaalsete seadmete, ebanormaalsete võrkude, automatiseeritud päringute ja kõrge riskitasemega toimingute tuvastamiseks võime samuti koguda või luua seadmete sõrmejälgi, seadme avaliku võtme identifikaatoreid, kliendi tüüpi, seadme riskisignaale, ebaõnnestunud sisselogimiste põhjuseid, koodi kontrollimise tulemusi, IP piirkonda või piirkondlikke riskimärgiseid, sisselogimisajalugu, riskiskoore, riskitasemeid ja võetud meetmeid. Konto riskijuhtimise eesmärgil me ei kogu kontakte, SMS-i sisu, kõnelogisid, fotoalbumeid, täpset asukohta, mikrofoni ega kaamera sisu.",
          dataUsageTitle: "2. Kuidas me teavet kasutame",
          dataUsageP1:
            "Kasutame asjakohast teavet kontode registreerimise, sisselogimise autentimise, kinnituskoodide edastamise, riskikontrolli, autoriseerimise kinnitamise, arendajarakenduste ülevaatamise, konto turvateadete ja teenuse usaldusväärsuse hooldamiseks.",
          dataUsageP2:
            "Analüüsime ka logisid ja statistikat minimaalselt vajalikul alusel, et tuvastada ebanormaalset tegevust, parandada tootekogemust ja tugevdada turvalisust.",
dataUsageP3:
            "Riskijuhtimise teavet kasutatakse peamiselt selleks, et otsustada, kas lubada sisselogimist või tundlike toimingute jätkamist, kas nõuda täiendavat e-posti või SMS-i kontrolli, kas nõuda telefoninumbri sidumist, kas käivitada lukustus pärast ebaõnnestunud katseid, kas salvestada riskisündmus, või aidata administraatoritel turvaprobleeme uurida. Kliendi esitatud riskiteavet kasutatakse ainult abistava signaalina ja see ei vähenda iseenesest turvaotsuseid.",
          dataSharingTitle: "3. Jagamine ja avalikustamine",
          dataSharingP1:
            "Anname kolmandate osapoolte rakendustele identiteediteavet või õigustega seotud andmeid ainult siis, kui autoriseerite autoriseerimislehel kuvatavad ulatused selgesõnaliselt.",
          dataSharingP2:
            "Välja arvatud juhul, kui seadus, regulatiivsed nõuded, avalike huvide kaitse või süsteemi turvavajadused seda nõuavad, ei müü ega jaga me teie isikuandmeid ebaseaduslikult mitteseotud kolmandate osapooltega.",
          userRightsTitle: "4. Teie õigused",
          userRightsP1:
            "Saate kontokeskuses vaadata ja uuendada oma profiili, sidumisi, autoriseerimiskirjeid ja turvaseadeid, samuti tühistada rakenduste nõusolekuid või esitada konto kustutamise taotluse.",
          userRightsP2:
            "Kui usute, et teave on ebatäpne, valesti töödeldud või kasutatud üle vajaliku, võite võtta ühendust platvormi operaatori või kasutada oma õigusi kehtiva seaduse alusel.",
          securityTitle: "5. Kaitse ja säilitamine",
          securityP1:
            "Kasutame teie isikuandmete ja autentimisandmete kaitsmiseks juurdepääsukontrolle, parooli räsimist, kinnituskoodide aegumist, auditi logisid ja andmete minimeerimise meetmeid.",
          securityP2:
            "Õiguslike ja äriliste nõuete kohaselt säilitame teie teavet ainult nii kaua, kui see on teenuse eesmärkide täitmiseks vajalik; pärast konto kustutamist või säilitamisperioodide lõppu kustutame või anonüümitame andmed vastavalt poliitikale.",
securityP3:
            "Riskilogisid, sisselogimisajalugu, seadmeprofiile ja ebaõnnestunud katsete kirjeid säilitatakse nii kaua, kui see on vajalik turvaauditite, vaidluste lahendamise, rünnakute uurimise ja vastavuse tagamiseks. Lekke- ja kuritarvitamise ohtu vähendame räsi, juurdepääsukontrolli, vähimate õiguste ja auditijälgede abil.",
        },
      },
    },
    auth: {
      noAccount: "Kontot pole?",
      registerNow: "Registreeru kohe",
      registerPageTitle: "Loo konto",
      registerPageSubtitle:
        "Täitke registreerimine oma riigi, e-posti ja e-posti kinnituskoodiga.",
      registerDisabled: "Registreerimine on hetkel keelatud",
      registerSuccess:
        "Registreerimine õnnestus. Palun logige sisse oma parooliga.",
      phoneBindingRequiredAfterRegister:
        "Registreerimine õnnestus. Palun siduge kõigepealt oma telefoninumber konto aktiveerimiseks.",
      registerFailed: "Registreerimine ebaõnnestus",
      country: "Riik",
      countryRequired: "Valige riik",
      registerCode: "E-posti kood",
      registerCodeRequired: "Sisestage e-posti kinnituskood",
      registerCodePlaceholder: "Sisestage 6-kohaline kood",
      sendRegisterCode: "Saada kood",
      sendRegisterCodeSuccess:
        "Kinnituskood on saadetud. Palun kontrollige oma postkasti.",
      sendRegisterCodeFailed: "Kinnituskoodi saatmine ebaõnnestus",
      legalConsentPrefix: "Olen lugenud ja nõustun",
      legalConsentAnd: "ja",
      accountAgreement: "Konto kasutustingimused",
      accountPrivacyPolicy: "Konto privaatsuspoliitika",
      legalConsentRequired: "Palun lugege ja nõustuge Konto kasutustingimuste ja Konto privaatsuspoliitikaga",
      backToLoginWithAccount: "Konto juba olemas? Logi sisse",
      forgotPassword: "Unustasid parooli?",
      forgotPasswordPageTitle: "Lähtesta parool",
      forgotPasswordPageSubtitle:
        "Lähtesta oma sisselogimisparool registreeritud e-posti ja kinnituskoodiga.",
      forgotPasswordPrompt: "Unustasid parooli?",
      forgotPasswordAction: "Taasta see",
      forgotPasswordDesc:
        "Pärast e-posti kinnitamist koodiga saate otse uue sisselogimisparooli seada.",
      forgotPasswordHint:
        "Sisestage oma registreeritud e-post, kinnituskood ja uus parool. Saate uue parooliga kohe pärast esitamist sisse logida.",
      goToOtpLogin: "Kasuta e-posti koodiga sisselogimist",
      resetCode: "Taastamiskood",
      sendResetCode: "Saada taastamiskood",
      sendResetCodeSuccess:
        "Taastamiskood on saadetud. Palun kontrollige oma postkasti.",
      sendResetCodeFailed: "Taastamiskoodi saatmine ebaõnnestus",
      resetPassword: "Lähtesta parool",
      resetPasswordSuccess:
        "Parool on lähtestatud. Palun logige sisse uue parooliga.",
      resetPasswordFailed: "Parooli lähtestamine ebaõnnestus",
      newPassword: "Uus parool",
      confirmNewPassword: "Kinnita uus parool",
      newPasswordPlaceholder: "Sisestage vähemalt 8 tähemärki pikk parool",
      confirmPassword: "Kinnita parool",
      confirmPasswordPlaceholder: "Sisestage parool uuesti",
      backToLogin: "Tagasi sisselogimisele",
      emailRequired: "Sisestage oma e-post",
      passwordRequired: "Sisestage oma parool",
      otpCodeRequired: "Sisestage e-posti kinnituskood",
      phoneRequired: "Sisestage oma telefoninumber",
      phoneOtpCodeRequired: "Sisestage SMS-kinnituskood",
      emailInvalid: "Sisestage kehtiv e-posti aadress",
      resetCodeRequired: "Sisestage taastamiskood",
      resetCodePlaceholder: "Sisestage 6-kohaline taastamiskood",
      newPasswordRequired: "Sisestage uus parool",
      confirmNewPasswordRequired: "Kinnitage uus parool uuesti",
      newPasswordMinLength: "Uus parool peab olema vähemalt 8 tähemärki",
      passwordMinLength: "Parool peab olema vähemalt 8 tähemärki",
      newPasswordMismatch: "Kaks uut parooli ei ühti",
      passwordMismatch: "Kaks parooli ei ühti",
      registrationClosed: "Registreerimine on hetkel suletud",
      login: "Logi sisse",
      passkeyLogin: "Pääsuklahv",
      passkeyLoginDesc:
        "Kasutage sellesse saiti juba seadmes või süsteemi kontos seotud pääsuklahvi.",
      passkeyLoginButton: "Kasuta pääsuklahvi",
      passkeyLoginHint:
        "Peate pääsuklahvi kontokeskuses siduma, enne kui saate seda siin kasutada.",
      passkeyLoginSuccess: "Pääsuklahv edukalt lisatud",
      passkeyNotAvailable:
        "Selles seadmes pole selle saidi jaoks pääsuklahvi saadaval. Kasutage muud sisselogimismeetodit.",
      qrLogin: "QR kood",
      qrLoginDesc: "Sisselogimiseks skannige QR koodi MySSO Android rakendusega.",
      qrLoginScanned: "Skannitud. Kinnitage sisselogimine mobiilirakenduses.",
      qrLoginScannedMask: "See QR kood on juba skannitud",
      qrLoginCancelled: "See QR sisselogimine on tühistatud",
      qrLoginExpired: "QR kood on aegunud. Värskendage.",
      qrLoginRefresh: "Värskenda QR koodi",
      downloadApp: "Laadi rakendus alla",
      passwordLogin: "Parool",
      otpLogin: "E-posti kood",
      phoneOtpLogin: "Telefonikood",
      email: "E-post",
      phone: "Telefoninumber",
      password: "Parool",
      otpCode: "E-posti kood",
      phoneOtpCode: "SMS-kood",
      mfaCode: "2FA kood",
      mfaPlaceholder: "Jäta tühjaks, kui kaheastmeline autentimine pole lubatud",
      sendOtpCode: "Saada e-posti kood",
      sendOtpCodeSuccess:
        "E-posti kood on saadetud. Palun kontrollige oma postkasti.",
      sendOtpCodeFailed: "Kinnituskoodi saatmine ebaõnnestus",
      sendOtpCodeEmailRequired: "Sisestage oma e-post enne koodi taotlemist",
      sendPhoneOtpCode: "Saada SMS-kood",
      sendPhoneOtpCodeSuccess:
        "SMS-kood on saadetud. Palun kontrollige oma telefoni.",
      sendPhoneOtpCodeFailed: "SMS-koodi saatmine ebaõnnestus",
      sendPhoneBindingCode: "Saada sidumiskood",
      sendPhoneBindingCodeSuccess:
        "Telefonisidumise kood on saadetud. Palun kontrollige oma telefoni.",
      sendPhoneBindingCodeFailed: "Telefonisidumise koodi saatmine ebaõnnestus",
      securityCaptcha: "Turvakontroll",
      securityCaptchaPlaceholder:
        "Sisestage turvakontrolli väärtus ja proovige uuesti",
      securityCaptchaHelp:
        "Kui praegune seade või IP saadab päringuid liiga sageli, täitke see turvakontroll enne uue koodi taotlemist.",
      securityCaptchaRequiredTip:
        "Päringute maht on kõrge. Täitke turvakontroll enne uue koodi taotlemist.",
      sendOtpCodePhoneRequired:
        "Sisestage oma telefoninumber enne koodi taotlemist",
      phoneBindingPageTitle: "Siduge telefoninumber",
      phoneBindingRegisterDesc:
        "See konto tabas registreerimisjärgset riskireeglit. Siduge telefoninumber enne jätkamist.",
      phoneBindingLoginDesc:
        "See konto tabas sisselogimise riskireeglit. Siduge telefoninumber enne jätkamist.",
      completePhoneBinding: "Sidu ja jätka",
      phoneBindingSuccess:
        "Telefoninumber edukalt seotud. Konto on jälle aktiivne.",
      mfaVerifyTitle: "Kaheastmeline kinnitamine",
      mfaVerifyEmailHint:
        "Kinnituskood saadeti aadressile {{target}}. Sisestage see sisselogimise jätkamiseks.",
      mfaVerifyPhoneHint:
        "Kinnituskood saadeti aadressile {{target}}. Sisestage see sisselogimise jätkamiseks.",
      loginStepUpTitle: "Lisa sisselogimise kinnitamine",
      loginStepUpEmailDesc:
        "See sisselogimine nõuab täiendavat e-posti kinnitamist. Kood saadetakse aadressile {{email}}.",
      loginStepUpSMSDesc:
        "See sisselogimine nõuab täiendavat telefonikinnitust. Kood saadetakse numbrile {{phone}}.",
      loginStepUpDualDesc:
        "See sisselogimine nõuab nii e-posti kui ka telefonikinnitust. E-post: {{email}}, telefon: {{phone}}.",
      loginStepUpExpired:
        "Lisa sisselogimise kinnitamise sessioon aegus. Palun logige uuesti sisse.",
      forcedMfaEnrollmentTitle: "Kaheastmeline autentimine peab olema lubatud",
      forcedMfaEnrollmentDesc:
        "Administraator nõuab, et see konto lubaks kaheastmelise autentimise, enne kui see sisselogimine saab lõpule viia.",
      forcedMfaEnrollmentExpired:
        "Sunnitud MFA registreerimise sessioon aegus. Palun logige uuesti sisse.",
      completeForcedMfaEnrollment: "Luba ja jätka",
      cancelForcedMfaEnrollment: "Tühista ja naase sisselogimisele",
      verifyAndLogin: "Kinnita ja logi sisse",
      deletionConfirmTitle: "Konto kustutamise taotlus esitatud",
      deletionConfirmScheduledAt: "Planeeritud kustutamise aeg: {{date}}",
      deletionConfirmDesc:
        "Uuesti sisselogimine tühistab kustutamise.",
      deletionConfirmContinue: "Jätka ja tühista kustutamine",
      deletionConfirmExpired: "Kinnitus aegus, palun logige uuesti sisse",
      deletionConfirmFailed: "Kinnitus ebaõnnestus, palun logige uuesti sisse",
      logoutProgressTitle: "Väljalogimine",
      logoutProgressDesc:
        "Identiteedisessioon on kustutatud ja ühendatud rakendustest logitakse välja.",
      loginFailed: "Sisselogimine ebaõnnestus",
      oidcCallbackFailed: "OIDC tagasihelistamine ebaõnnestus",
      appRejected: "Rakendus tagasi lükatud",
      appRejectedWithReason: "Rakendus tagasi lükatud: {{reason}}",
      appNotFound: "Rakendust ei leitud",
      accessDenied: "Juurdepääs keelatud",
      tokenExchangeFailed: "Tokeni vahetus ebaõnnestus",
      authorize: {
        title: "Kasutage {{siteName}} kontot rakendusse {{appName}} sisselogimiseks",
        desc: "See rakendus taotleb järgmist teavet ja õigusi. Pärast kinnitamist naasete ärirakendusse sisselogimise lõpetamiseks.",
        chooseAccountTitle: "Olete juba {{siteName}} sisse logitud",
        chooseAccountDesc:
          "Valige, kas soovite jätkata praeguse kontoga või logida kõigepealt teise kontoga sisse.",
        currentAccountFallback: "Praegune konto",
        useCurrentAccount: "Jätka selle kontoga",
        useAnotherAccount: "Logi sisse teise kontoga",
        permissionTitle: "Taotletud õigused",
        permissionCount: "{{count}} üksust",
        agreement:
          "Olen lugenud ja nõustun ülaltoodud õiguste andmisega",
        confirm: "Kinnita ja jätka",
        cancel: "Tühista ja naase sisselogimisele",
        errors: {
          applicationRejected: "Rakendus tagasi lükatud",
          applicationRejectedWithReason: "Rakendus tagasi lükatud: {{reason}}",
          applicationAccessRestricted: "Rakenduse juurdepääs on piiratud",
          applicationAccessBanned: "Rakenduse juurdepääs on keelatud",
          applicationAccessBannedWithReason: "Rakenduse juurdepääs on keelatud: {{reason}}",
          applicationNotApproved: "Rakendus pole kinnitatud",
          applicationNotFound: "Rakendust ei leitud",
          forbidden: "Teil pole õigust selle rakenduse kasutamiseks",
          unsupportedResponseType: "Toetamata vastuse tüüp",
          redirectUriMismatch: "Ümbersuunamise URI ei ühti",
          scopeNotAllowed: "Taotletud ulatus pole lubatud",
          openidScopeRequired: "On nõutav openid ulatus",
          codeChallengeMethodRequiresCodeChallenge: "Kui on määratud code_challenge_method, on nõutav ka code_challenge",
          unsupportedCodeChallengeMethod: "Toetamata code challenge meetod",
          promptNoneMustNotBeCombinedWithOtherValues: "Prompti väärtus none ei saa olla koos muude väärtustega",
          invalidMaxAge: "Max_age väärtus on vigane",
          acrValuesNotSatisfied: "Praegune sessioon ei täida taotletud autentimiskonteksti nõudeid",
          consentRequired: "Nõutav on täiendav nõusolek",
          loginRequired: "Palun logige uuesti sisse jätkamiseks",
          authorizeFailed: "Autoriseerimine ebaõnnestus. Palun proovige hiljem uuesti.",
          loadAuthorizationSettingsFailed: "Autoriseerimise seadistuste laadimine ebaõnnestus",
          networkRequestFailed: "Võrgu päring ebaõnnestus. Palun kontrollige oma ühendust ja proovige uuesti.",
          apiReturnedHtml: "Autoriseerimisteenus tagastas ootamatu lehe. Palun kontrollige API või pöördproksi seadistust.",
        },
        scopes: {
          openidTitle: "Kinnita oma identiteet",
          openidDesc:
            "Kasutatakse praeguse sisselogitud konto kuuluvuse teie kontrollimiseks ja baassessiooni sisselogimise loomiseks.",
          profileTitle: "Pääse juurde oma avalikule profiilile",
          profileDesc:
            "Sisaldab teie kuvanime, avatari ja sarnaseid avalikke profiiliandmeid rakenduses kuvamiseks.",
          emailTitle: "Pääse juurde oma e-posti teabele",
          emailDesc:
            "Kasutatakse teie kontoe-posti kuvamiseks või teadete ja kontosidumise toetamiseks vajadusel.",
          phoneTitle: "Pääse juurde oma telefoninumbrile",
          phoneDesc:
            "Kasutatakse kontotuvastuseks, teadeteks või turvakinnituseks vajadusel.",
          gatewayReadTitle: "Pääse juurde kaitstud äri-API-dele",
          gatewayReadDesc:
            "Lubab rakendusel pääseda teie autoriseeritud identiteedina kaitstud ressurssidele juurde.",
          customTitle: "Taotleb õigust: {{scope}}",
          customDesc:
            "See rakendus taotleb täiendavat äriõigust. Vaadake see enne jätkamist hoolikalt üle.",
        },
      },
      sessionConflict: {
        title: "Selles brauseris tuvastati erinevad kontod",
        desc: "Selle akna poolt meelde jäetud konto ei ühti brauseri praegu aktiivse kontoga. Samas brauseris saab korraga aktiivsena püsida ainult üks peamine konto. Valige, millise kontoga soovite jätkata.",
        browserAccount: "Brauseri aktiivne konto",
        thisWindowAccount: "Selle akna eelmine konto",
        useBrowserAccount: "Kasuta brauseri aktiivset kontot",
        useThisWindowAccount: "Naase selle akna kontole",
        relogin: "Logi välja ja logi uuesti sisse",
      },
    },
    nav: {
      security: "Sisselogimine ja turvalisus",
      profile: "Profiil",
      privacy: "Privaatsuskeskus",
      bindings: "Autoriseeritud rakendused",
      help: "Abikeskus",
    },
    common: {
      loadingFailed: "Laadimine ebaõnnestus",
      revokeFailed: "Nõusoleku tühistamine ebaõnnestus",
      revokeSuccess: "Nõusolek tühistatud",
      confirm: "Kinnita",
      sendCode: "Saada kood",
      sendCodeSuccess: "Kinnituskood edukalt saadetud",
      sendingCode: "Saatmine",
      save: "Salvesta",
      saving: "Salvestamine",
      edit: "Muuda",
      cancel: "Tühista",
      uploadAvatar: "Laadi avatar üles",
      avatarUpdated: "Avatar uuendatud",
      avatarUploadFailed: "Avatari üleslaadimine ebaõnnestus",
      profileUpdated: "Profiil uuendatud",
      profileUpdateFailed: "Profiili uuendamine ebaõnnestus",
      imageReadFailed: "Pildi lugemine ebaõnnestus",
      imageProcessUnsupported:
        "Pilditöötlus ei ole selles brauseris toetatud",
      avatarConvertFailed: "Avatari konverteerimine ebaõnnestus",
      unset: "Määramata",
      unsetShort: "Määramata",
      notFilled: "Täitmata",
      noRecord: "Kirjeid pole",
      normal: "Aktiivne",
      accountCenter: "Kontokeskus",
      noAuthorizedApps: "Autoriseeritud rakendusi pole",
    },
    errors: {
      applicationDisabled: "See rakendus on keelatud",
      emailRequiredByServer: "Palun sisestage oma e-post",
      passwordRequiredByServer: "Palun sisestage oma parool",
      invalidCredentials: "Vale konto või volitused",
      invalidOtpCode: "Kinnituskood on vale või aegunud",
      accountFrozen: "See konto on külmutatud",
      accountFrozenWithReason:
        "See konto on külmutatud. Põhjus: {{reason}}",
      userNotFound: "Kasutajat ei leitud",
      smsNotConfigured: "SMS-i saatmine pole konfigureeritud",
      smtpNotConfigured: "E-posti saatmine pole konfigureeritud",
      userStatusInvalid:
        "Praegune konto olek ei luba seda toimingut",
      invalidCurrentPhoneVerificationCode:
        "Praegune telefonikinnituskood on vale või aegunud",
      invalidNewPhoneVerificationCode:
        "Uus telefonikinnituskood on vale või aegunud",
      currentPhoneVerificationCodeRequired:
        "Sisestage praegune telefonikinnituskood",
      currentPhoneNotBound:
        "Praegu pole sellele kontole telefoninumbrit seotud",
      phoneDoesNotMatchCurrentBoundPhone:
        "Telefoninumber ei ühti praegu seotud numbri",
      phoneAlreadyBound: "See telefoninumber on juba seotud",
      newPhoneMustBeDifferent:
        "Uus telefoninumber peab olema praegusest erinev",
      phoneAndVerificationCodeRequired:
        "Sisestage telefoninumber ja uus telefonikinnituskood",
      invalidMfaCode: "Kaheastmeline kinnituskood on vale või aegunud",
      unsupportedMfaMethod: "Toetamata kaheastmeline autentimismeetod",
      mfaNotEnabled:
        "Kaheastmeline autentimine pole sellel kontol lubatud",
      emailNotBound: "Praegu pole sellele kontole e-posti seotud",
      phoneNotBound: "Praegu pole sellele kontole telefoninumbrit seotud",
      emailVerificationCodeRequired: "Sisestage e-posti kinnituskood",
      invalidEmailVerificationCode:
        "E-posti kinnituskood on vale või aegunud",
      phoneVerificationCodeRequired: "Sisestage telefonikinnituskood",
      invalidPhoneVerificationCode:
        "Telefonikinnituskood on vale või aegunud",
      newPasswordMustBeDifferentFromCurrentPassword:
        "Uus parool peab olema praegusest paroolist erinev",
      phoneBindingChallengeExpired:
        "Telefonisidumise sessioon aegus. Palun logige uuesti sisse või registreeruge uuesti.",
      manualMfaCodeNotSendable:
        "See konto kasutab käsitsi MFA koodi ja ei saa koodi saata",
      emailAndPasswordRequired:
        "Sisestage oma e-post ja parool enne kaheastmelise koodi taotlemist",
      mfaChallengeExpiredOrInvalid:
        "Kaheastmelise kinnitamise sessioon aegus. Palun logige uuesti sisse.",
      challengeRequired:
        "Täitke turvakontroll enne koodi taotlemist.",
      captchaRequired:
        "Päringute maht on kõrge. Täitke kõigepealt turvakontroll.",
      circuitOpen:
        "Edastuskanal on ajutiselt kaitstud. Palun proovige hiljem uuesti.",
      cooldownActive:
        "See siht on taotlenud koode liiga sageli. Palun proovige hiljem uuesti.",
      passkeyChallengeExpired: "Pääsuklahvi sessioon aegus. Palun proovige uuesti.",
      passkeyVerificationFailed:
        "Pääsuklahvi kinnitamine ebaõnnestus. Proovige uuesti või kasutage muud sisselogimismeetodit.",
      passkeyAlreadyExists: "See pääsuklahv on juba seotud.",
      passkeyNotFound: "Pääsuklahvi ei leitud.",
      passkeyBrowserUnsupported:
        "See brauser või seade ei toeta pääsuklahve.",
      passkeyUserHandleInvalid:
        "Selle pääsuklahvi kontot ei õnnestunud tuvastada.",
      invalidLoginStepUpVerificationCode:
        "Lisa kinnituskood on vale või aegunud.",
      invalidMfaEnrollmentVerificationCode: "Kaheastmelise autentimise lubamise kinnituskood on vale või aegunud",
      loginStepUpChallengeExpiredOrInvalid:
        "Lisa kinnitamise sessioon aegus. Palun logige uuesti sisse.",
      mfaEnrollmentChallengeExpiredOrInvalid:
        "Sunnitud MFA registreerimise sessioon aegus. Palun logige uuesti sisse.",
      noAvailableMfaMethodForCurrentAccount:
        "Sellele kontole pole MFA meetodit saadaval.",
      noAvailableLoginVerificationTargetForCurrentAccount:
        "Sellele kontole pole lisakinnituse sihtmärki saadaval.",
    },
    security: {
      loginMethods: "Sisselogimismeetodid",
      phone: "Siduge telefoninumber",
      phoneDesc:
        "Kasutatakse täiendavate sisselogimismeetodite, SMS-kinnituse ja konto turvateadete jaoks",
      bindPhone: "Sidu",
      bindPhoneTitle: "Siduge telefoninumber",
      bindPhoneHint:
        "Kinnitage telefoninumber kõigepealt enne sidumist. Kinnituskood saadetakse sellele telefoninumbrile.",
      rebindPhoneHint:
        "Seotud telefoninumbri asendamiseks kinnitage kõigepealt praegune telefoninumber ja seejärel uus.",
      currentPhone: "Praegu seotud telefoninumber",
      currentPhoneCode: "Praegune telefonikinnituskood",
      currentPhoneCodePlaceholder:
        "Sisestage praegusele telefoninumbrile saadetud 6-kohaline kood",
      sendCurrentPhoneCode: "Saada praegune telefonikood",
      newPhone: "Telefoninumber",
      newPhoneCode: "Uus telefonikinnituskood",
      newPhonePlaceholder: "Sisestage telefoninumber, näiteks 13800138000",
      smsCode: "SMS-kinnituskood",
      smsCodePlaceholder: "Sisestage 6-kohaline SMS-kood",
      safeEmail: "Turvaline e-post",
      safeEmailDesc: "Sisselogimiseks kasutatavad peamised volitused",
      editEmailTitle: "Muuda turvalist e-posti",
      newEmail: "Uus e-post",
      newEmailPlaceholder: "Sisestage uus e-posti aadress",
      emailCode: "E-posti kood",
      emailCodePlaceholder: "Sisestage 6-kohaline kood",
      changeEmailHint:
        "Uus e-post peab enne muudatuse salvestamist kinnitama.",
      changePassword: "Muuda parooli",
      changePasswordDesc:
        "Uuendage oma sisselogimisparooli regulaarselt konto turvalisuse parandamiseks",
      editPasswordTitle: "Muuda sisselogimisparooli",
      currentPassword: "Praegune parool",
      currentPasswordPlaceholder: "Sisestage oma praegune parool",
      currentPasswordIncorrect: "Praegune parool on vale",
      newPassword: "Uus parool",
      newPasswordPlaceholder: "Sisestage uus parool vähemalt 8 tähemärgiga",
      confirmPassword: "Kinnita uus parool",
      confirmPasswordPlaceholder: "Sisestage uus parool uuesti",
      changePasswordHint:
        "Kasutage uut parooli järgmisel sisselogimisel ja vältige vana kordamist.",
      passwordMinLength: "Parool peab olema vähemalt 8 tähemärki",
      passwordMismatch: "Kaks uut parooli ei ühti",
      passwordUpdated: "Parool uuendatud",
      passwordUpdateFailed: "Parooli uuendamine ebaõnnestus",
      mfa: "Kaheastmeline autentimine",
      mfaDesc: "Lubamisel nõuab sisselogimisel lisakinnitust",
      mfaTitle: "Konfigureeri kaheastmeline autentimine",
      mfaHint: "Valige sisselogimisel kasutatav teine kinnitamise meetod.",
      mfaTitleEnable: "Luba kaheastmeline autentimine",
      mfaTitleDisable: "Keela kaheastmeline autentimine",
      mfaHintEnable:
        "Valige sisselogimisel kasutatav teine kinnitamise meetod.",
      mfaHintDisable:
        "Pärast keelamist ei nõuta sisselogimisel enam lisakinnitust.",
      mfaMethod: "Kinnitamise meetod",
      mfaMethodEmail: "E-posti kood",
      mfaMethodSMS: "Telefonikood",
      passkeys: "Pääsuklahvid",
      passkeysDesc:
        "Pärast sidumist saate sisse logida otse süsteemi pääsuklahvi valijast.",
      addPasskey: "Lisa pääsuklahv",
      deletePasskey: "Kustuta pääsuklahv",
      passkeyName: "Seadme nimi",
      passkeyNamePlaceholder: "Sisestage äratuntav nimi",
      passkeyLastUsed: "Viimati kasutatud",
      passkeyLastUsedIP: "Viimati kasutatud IP",
      passkeyCreatedAt: "Loodud",
      passkeyEmpty: "Pääsuklahve pole seotud",
      passkeyManageVerify:
        "Konto kaitsmiseks kinnitage oma praegused volitused enne pääsuklahvi lisamist või kustutamist.",
      currentMfaCode: "Praegune MFA kood",
      currentMfaCodePlaceholder: "Sisestage kood praegusest MFA meetodist",
      currentMfaCodeHintEmail:
        "Täitke kinnitamine praegu seotud e-posti koodiga enne salvestamist.",
      currentMfaCodeHintSMS:
        "Täitke kinnitamine praegu seotud telefonikoodiga enne salvestamist.",
      currentMfaCodeHintManual:
        "Sisestage praegu konfigureeritud käsitsi MFA kood enne salvestamist.",
      accountSecurity: "Konto turvalisus",
      recentLogin: "Viimane sisselogimine",
      recentLoginDesc: "Viimase eduka sisselogimise aeg ja seadme IP",
    },
    profile: {
      title: "Profiil",
      avatar: "Avatar",
      avatarDesc:
        "Pilt lõigatakse automaatselt keskele ja konverteeritakse webp formaati",
      nickname: "Hüüdnimi",
      nicknameDesc: "Praegune kuvatav nimi",
      gender: "Sugu",
      genderDesc: "Selle konto profiili suguinfo",
      languagePreference: "Keele eelistus",
      languagePreferenceDesc:
        "Pärast sisselogimist kasutatakse seda keelt lehekülje sisu jaoks esimesena",
      languagePreferenceSaved: "Keele eelistus salvestatud",
      languagePreferenceSaveFailed: "Keele eelistuse salvestamine ebaõnnestus",
      genderMale: "Mees",
      genderFemale: "Naine",
      genderOther: "Muu",
      userId: "Kasutaja ID",
      userIdDesc: "Praeguse konto unikaalne identifikaator süsteemis",
      nicknamePlaceholder: "Sisestage hüüdnimi",
      editNicknameTitle: "Muuda hüüdnime",
      editGenderTitle: "Muuda sugu",
      email: "E-posti aadress",
      emailDesc: "Kasutatakse sisselogimiseks, kinnitamiseks ja turvateadeteks",
      createdAt: "Registreeritud",
      createdAtDesc: "Aeg, mil see konto loodi",
      country: "Registreerimisriik",
      countryDesc: "Registreerimisel registreeritud riik või piirkond",
    },
    privacy: {
      title: "Privaatsuskeskus",
      exportTitle: "Laadi alla kasutajaandmed",
      exportDesc:
        "Ekspordi profiiliandmed ja tühistamata autoriseeritud rakendused CSV formaadis.",
      exportAction: "Laadi andmed alla",
      exportPasswordVerifyDesc:
        "Kinnitage oma praegune sisselogimisparool enne allalaadimist. CSV sisaldab profiiliandmeid ja tühistamata autoriseeritud rakendusi.",
      exportSuccess: "Kasutajaandmete allalaadimine alustatud",
      exportFailed: "Kasutajaandmete eksportimine ebaõnnestus",
      minimizeTitle: "Andmete minimeerimine",
      minimizeDesc:
        "Süsteem säilitab ainult registreerimisriigi, e-posti, nõusolekud ja olulised sisselogimise turvaandmed.",
      scopeTitle: "Praegune juurdepääsu ulatus",
      scopeDesc:
        "Saate vaadata oma kontole juurdepääsu saanud rakendusi Autoriseeritud rakendustes ja tühistada need igal ajal.",
      statusTitle: "Konto olek",
      statusDesc:
        "Kui konto on külmutatud, blokeeritakse sisselogimine, kuni administraator lahendab selle.",
      deleteTitle: "Kustuta konto",
      deleteDesc:
        "Kui logite 7 päeva jooksul uuesti sisse, tühistatakse kustutamistaotlus automaatselt. Vastasel juhul eemaldatakse konto ja nõusolekuandmed.",
      deleteWarningPrimary:
        "Konto kustutamine on pöördumatu. Palun varundage kõigepealt kõik selle kontoga seotud andmed.",
      deleteWarningSecondary:
        "Pärast taotluse esitamist tühistab 7 päeva jooksul uuesti sisselogimine kustutamise. Kui te ei logi 7 päeva jooksul sisse, kustutab süsteem konto ja nõusolekuandmed automaatselt.",
      deleteAction: "Olen lugenud ja aktsepteerin tagajärgi",
      passwordVerifyTitle: "Kinnitage praegune parool",
      passwordVerifyDesc:
        "Sisestage oma praegune sisselogimisparool ja täitke e-posti kinnitamine. Kui telefoninumber on seotud, nõutakse ka telefonikinnitust.",
      emailVerifyCode: "E-posti kinnituskood",
      emailVerifyCodePlaceholder: "Sisestage oma e-postile saadetud 6-kohaline kood",
      sendDeleteEmailCode: "Saada e-posti kood",
      sendDeleteEmailCodeSuccess:
        "E-posti kinnituskood on saadetud. Palun kontrollige oma postkasti.",
      sendDeleteEmailCodeFailed: "E-posti kinnituskoodi saatmine ebaõnnestus",
      phoneVerifyCode: "Telefonikinnituskood",
      phoneVerifyCodePlaceholder: "Sisestage oma telefonile saadetud 6-kohaline kood",
      sendDeletePhoneCode: "Saada telefonikood",
      sendDeletePhoneCodeSuccess:
        "Telefonikinnituskood on saadetud. Palun kontrollige oma telefoni.",
      sendDeletePhoneCodeFailed: "Telefonikinnituskoodi saatmine ebaõnnestus",
      confirmDeleteNow: "Esita kustutamistaotlus",
      deleteSuccess:
        "Kustutamistaotlus esitatud. 7 päeva jooksul sisselogimine tühistab selle.",
      deleteFailed: "Kustutamistaotluse esitamine ebaõnnestus",
      deletePendingAt:
        "Kustutamistaotlus esitatud. Planeeritud kustutamise aeg: {{date}}",
    },
    bindings: {
      title: "Autoriseeritud rakendused",
      appId: "Rakenduse nimi",
      scopes: "Ulatus",
      createdAt: "Autoriseeritud",
      authorizedAt: "Autoriseeritud",
      status: "Olek",
      action: "Toiming",
      viewDetails: "Detailid",
      detailTitle: "Autoriseerimise detailid",
      siteName: "Autoriseeritud sait",
      requestedPermissions: "Antud õigused",
      scopeOpenIdTitle: "Kinnita oma identiteet",
      scopeOpenIdDesc:
        "Kasutatakse kinnitamiseks, et sisselogitud konto on tõesti teie oma, ja baassessiooni sisselogimise loomiseks.",
      scopeProfileTitle: "Pääse juurde oma avalikule profiilile",
      scopeProfileDesc:
        "Sisaldab hüüdnime, avatari ja muid avalikke profiiliandmeid rakenduses kuvamiseks.",
      scopeEmailTitle: "Pääse juurde oma e-posti aadressile",
      scopeEmailDesc:
        "Kasutatakse kontoe-posti kuvamiseks või teadete saatmiseks ja kontosidumiseks vajadusel.",
      scopePhoneTitle: "Pääse juurde oma telefoninumbrile",
      scopePhoneDesc:
        "Kasutatakse kontotuvastuseks, teadeteks või turvakinnituseks vajadusel.",
      scopeGatewayReadTitle: "Pääse juurde kaitstud äri-API-dele",
      scopeGatewayReadDesc:
        "Lubab rakendusel pärast autoriseerimist teie nimel kaitstud API ressurssidele juurde pääseda.",
      scopeCustomTitle: "Taotletud õigus: {{scope}}",
      scopeCustomDesc:
        "See rakendus taotleb täiendavat äriõigust. Vaadake see enne jätkamist hoolikalt üle.",
      revoke: "Tühista",
      batchRevoke: "Hulgitühistamine",
      batchRevokeConfirmTitle: "Kinnita hulgitühistamine?",
      batchRevokeConfirmDesc:
        "{{count}} autoriseerimist on valitud. Need rakendused peavad uuesti nõusolekut taotlema.",
    },
    help: {
      title: "Abikeskus",
      loginIssueTitle: "Ei saa sisse logida",
      loginIssueDesc:
        "Kui te ei saa sisse logida, kinnitage kõigepealt, et kasutate kontole õiget meetodit, näiteks parooli, e-posti koodi, telefonikoodi või pääsuklahvi. Kui kinnituskood tagasi lükatakse, veenduge, et see oleks uusim ja veel kehtivusaega jäänud. Kui konto kuvatakse külmutatuna, aktiveerimist ootavana või muul viisil piiratuna, peab probleemi lahendama platvormi administraator. Kui olete hiljuti esitanud konto kustutamistaotluse, võib süsteem nõuda ka kustutamise kinnitamist või telefonisidumist enne juurdepääsu taastamist.",
      protectTitle: "Kaitse oma kontot",
      protectDesc:
        "Lubage võimalikult kiiresti kaheastmeline autentimine ja siduge usaldusväärsetes seadmetes pääsuklahvid, et vähendada ainult parooli lekkimise riski. Ärge jagage kunagi e-posti koode, SMS-koode ega MFA koode kolmandate osapooltega ja ärge sisestage volitusi uuesti lehekülgedel, millele te ei usalda. Kui kasutate sama kontot mitmes seadmes, vaadake regulaarselt üle hiljutised sisselogimised, seotud pääsuklahvid ja autoriseeritud rakendused ning eemaldage seadmed või autoriseerimised, mida te enam ei kasuta.",
      authIssueTitle: "Autoriseerimise probleemid",
      authIssueDesc:
        "Kui rakendus tundub võõras, taotleb ebatavalisi ulatusi või kahtlustate, et see kuritarvitab teie kontot, avage Autoriseeritud rakendused, et vaadata selle autoriseerimise aega, antud ulatusi ja integreerimise detaile, ning tühistage see vajadusel kohe. Pärast tühistamist ei saa rakendus enam teie kontoga kaitstud ressurssidele juurde pääseda, kuni logite uuesti sisse ja kiidate heaks uue nõusolekutaotluse. Kui probleem võib mõjutada kogu kontot pigem kui üksikut rakendust, peaksite samuti muutma oma parooli, kontrollima oma MFA seadeid ja vaatama üle hiljutised sisselogimised ja pääsuklahvide tegevuse.",
      contactTitle: "Võta meiega ühendust",
      contactDesc:
        "Kui vajate manuaalset abi, võite pöörduda allpool oleva platvormi toe poole. Probleemist teatamisel lisage konto e-post, probleemi tekkimise aeg, veateadete ekraanipildid, kasutatud sisselogimismeetod ning asjakohased seadme või brauseri andmed, et probleemi saaks kiiremini uurida.",
      contactMainlandTitle: "Mandri-Hiina",
      contactOverseasTitle: "Välismaa",
      contactPersonLabel: "Kontaktisik:",
      contactPhoneLabel: "Telefon:",
      contactEmailLabel: "E-post:",
      contactHoursLabel: "Toetamise tunnid:",
      contactMainlandPersonValue: "YOUR_NAME",
      contactMainlandPhoneValue: "YOUR_PHONE_NUMBER",
      contactMainlandEmailValue: "YOUR_EMAIL",
      contactMainlandHoursValue: "Esmaspäevast reedeni 09:00 - 18:00",
      contactOverseasPersonValue: "YOUR_NAME_Oversea",
      contactOverseasPhoneValue: "YOUR_PHONE_Oversea",
      contactOverseasEmailValue: "YOUR_EMAIL_Oversea",
      contactOverseasHoursValue: "Esmaspäevast reedeni 09:00 - 18:00",
      contactRegionNotice:
        "Palun võtke kõigepealt ühendust oma piirkonna toekanali. Kui te ei ole kindel, milline piirkond kehtib, alustage mandri-Hiina kontaktist suunamise abi saamiseks.",
      contactNotice:
        "Külmutatud kontode, ebanormaalsete autoriseerimiste, kadunud pääsuklahvide või kustutamise taastamise probleemide korral võtke kõigepealt ühendust administraatoriga ülaltoodud telefoninumbri või e-posti kaudu. Kui teie platvorm pakub ametlikku piletisüsteemi, teadetetahvlit või operatsioonigruppi, järgige kõigepealt ametlikku kanalit.",
    },
  },
} as const;

export default locale;
