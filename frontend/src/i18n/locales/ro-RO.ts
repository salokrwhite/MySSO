const locale = {
  translation: {
    header: {
      language: "Limba",
      languageModalTitle: "Alegeți Limba",
      languageModalDesc: "Selectați limba interfeței pe care doriți să o utilizați.",
      agreement: "Acordul Utilizatorului",
      privacy: "Politica de Confidențialitate",
      help: "Centrul de Ajutor",
      logout: "Deconectare",
      accountCenter: "Centrul Contului",
    },
    captcha: {
      securityVerification: "Verificare de securitate",
      refresh: "Reîmprospătare",
      imageCaptcha: "Captcha cu imagine",
      imageCaptchaRequired: "Vă rugăm să completați captcha cu imagine",
    },
    legal: {
      back: "Înapoi la Pagina Principală",
      updatedAt: "Ultima actualizare: {{date}}",
      agreement: {
        title: "Acordul Utilizatorului",
        updatedAt: "2026-03-16",
        intro:
          "Bine ați venit la {{siteName}}. Înainte de a vă înregistra, autentifica, integra sau utiliza serviciile de identitate unificată, vă rugăm să citiți cu atenție acest acord. Prin continuarea utilizării serviciului, sunteți de acord să fiți obligat de acest acord.",
        sections: {
          accountTitle: "1. Cont și Autentificare",
          accountP1:
            "Trebuie să furnizați informații de înregistrare adevărate, legale și accesibile și să vă păstrați în siguranță contul, parola, codurile de verificare și alte acreditări. Sunteți responsabil pentru pierderile cauzate de o gestionare slabă a acreditărilor din partea dvs.",
          accountP2:
            "Dacă se detectează activitate anormală de autentificare, încălcări ale politicii, stare înghețată sau riscuri de securitate, platforma poate solicita verificare suplimentară, poate restricționa autentificarea sau poate suspenda accesul din motive de siguranță.",
          acceptableUseTitle: "2. Utilizare Acceptabilă",
          acceptableUseP1:
            "Nu trebuie să utilizați acest sistem pentru nicio activitate ilegală, încălcare a drepturilor, abuz de interfețe de autentificare, solicitări în masă, atacuri cu acreditări sau orice comportament care amenință stabilitatea platformei sau ocolirea controalelor de securitate.",
          acceptableUseP2:
            "Dacă încălcați acest acord sau regulile conexe, platforma vă poate suspenda sau întrerupe accesul parțial sau total și își rezervă dreptul de a urmări responsabilitatea atunci când este necesar.",
          authorizationTitle: "3. Autorizare și Aplicații Terțe",
          authorizationP1:
            "Când utilizați un cont {{siteName}} pentru a vă autentifica într-o aplicație terță, sistemul vă va cere consimțământul pe baza permisiunilor afișate pe pagina de autorizare. Puteți refuza sau revoca acel consimțământ în orice moment în centrul de cont.",
          authorizationP2:
            "Orice utilizare a datelor dvs. de către o aplicație terță după autorizare este guvernată de proprii termeni de serviciu și politică de confidențialitate a acelei aplicații. Platforma își va asuma responsabilitatea numai în domeniul de aplicare cerut de lege.",
          developerTitle: "4. Integrare pentru Dezvoltatori",
          developerP1:
            "Dezvoltatorii trebuie să se asigure că informațiile despre aplicație, URI-urile de redirecționare, domeniile solicitate și scopurile comerciale sunt adevărate, complete și valabile în permanență și nu trebuie să inducă în eroare utilizatorii.",
          developerP2:
            "Platforma poate revizui, respinge, elimina, șterge sau restricționa aplicațiile conectate pentru a menține securitatea și integritatea ecosistemului de identitate unificată.",
          liabilityTitle: "5. Modificări ale Serviciului și Limitarea Răspunderii",
          liabilityP1:
            "Din motive de securitate, conformitate, operațiuni sau întreținere, platforma poate ajusta, actualiza, suspenda sau întrerupe anumite interfețe, fluxuri sau funcții și va încerca să ofere notificări atunci când este adecvat.",
          liabilityP2:
            "În măsura permisă de lege, platforma nu este răspunzătoare dincolo de obligațiile legale pentru întreruperi, date anormale sau pierderi cauzate de forță majoră, defecțiuni de rețea, motive terțe sau utilizare necorespunzătoare din partea dvs.",
        },
      },
      privacy: {
        title: "Politica de Confidențialitate",
        updatedAt: "2026-03-16",
        intro:
          "{{siteName}} apreciază informațiile dvs. personale și securitatea contului. Această politică explică modul în care colectăm, utilizăm, stocăm, partajăm și protejăm informațiile dvs., precum și drepturile disponibile pentru dvs.",
        sections: {
          dataCollectionTitle: "1. Informațiile pe care le Colectăm",
          dataCollectionP1:
            "Când vă înregistrați, vă autentificați sau utilizați serviciile de cont, putem colecta țara de înregistrare, adresa de e-mail, numărul de telefon, hash-ul parolei, sesiunile de autentificare, IP-ul dispozitivului, înregistrările de autorizare și jurnalele de securitate necesare.",
          dataCollectionP2:
            "Când încărcați un avatar, vă schimbați profilul, legați un număr de telefon, activați MFA sau autorizați o aplicație terță, procesăm informațiile pe care le trimiteți după cum este necesar pentru a oferi acea funcție.",
          dataUsageTitle: "2. Cum Utilizăm Informațiile",
          dataUsageP1:
            "Utilizăm informațiile relevante pentru a furniza înregistrarea contului, autentificarea la autentificare, livrarea codului de verificare, controlul riscului, confirmarea autorizării, revizuirea aplicației pentru dezvoltatori, notificările de securitate ale contului și menținerea fiabilității serviciului.",
          dataUsageP2:
            "De asemenea, analizăm jurnalele și statisticile pe o bază minim-necesară pentru a detecta activitatea anormală, a îmbunătăți experiența produsului și a consolida securitatea.",
          dataSharingTitle: "3. Partajare și Divulgare",
          dataSharingP1:
            "Furnizăm informații de identitate sau date legate de permisiuni aplicațiilor terțe numai atunci când autorizați în mod explicit domeniile afișate pe pagina de autorizare.",
          dataSharingP2:
            "Cu excepția cazului în care este cerut de lege, solicitări de reglementare, protecția interesului public sau nevoile de securitate ale sistemului, nu vindem și nu partajăm ilegal informațiile dvs. personale cu terțe părți necorelate.",
          userRightsTitle: "4. Drepturile Dvs.",
          userRightsP1:
            "Puteți revizui și actualiza profilul, legăturile, înregistrările de autorizare și setările de securitate în centrul de cont și puteți revoca consimțămintele aplicației sau puteți trimite o solicitare de ștergere a contului.",
          userRightsP2:
            "Dacă credeți că informațiile dvs. sunt inexacte, procesate necorespunzător sau utilizate dincolo de necesitate, puteți contacta operatorul platformei sau vă puteți exercita drepturile în conformitate cu legea aplicabilă.",
          securityTitle: "5. Protecție și Păstrare",
          securityP1:
            "Utilizăm controale de acces, hashing de parole, expirarea codului de verificare, jurnale de audit și măsuri de minimizare a datelor pentru a vă proteja informațiile personale și datele de autentificare.",
          securityP2:
            "Supuși cerințelor legale și comerciale, păstrăm informațiile dvs. numai atât timp cât este necesar pentru a îndeplini scopurile serviciului; după ștergerea contului sau expirarea perioadelor de păstrare, vom șterge sau anonimiza datele în conformitate cu politica.",
        },
      },
    },
    auth: {
      noAccount: "Nu aveți cont?",
      registerNow: "Înregistrați-vă acum",
      registerPageTitle: "Creați Cont",
      registerPageSubtitle:
        "Finalizați înregistrarea cu țara, e-mailul și codul de verificare prin e-mail.",
      registerDisabled: "Înregistrarea este momentan dezactivată",
      registerSuccess:
        "Înregistrare reușită. Vă rugăm să vă autentificați cu parola.",
      phoneBindingRequiredAfterRegister:
        "Înregistrare reușită. Vă rugăm să legați numărul de telefon pentru a activa contul mai întâi.",
      registerFailed: "Înregistrare eșuată",
      country: "Țara",
      countryRequired: "Selectați o țară",
      registerCode: "Cod E-mail",
      registerCodeRequired: "Introduceți codul de verificare prin e-mail",
      registerCodePlaceholder: "Introduceți codul de 6 cifre",
      sendRegisterCode: "Trimiteți Cod",
      sendRegisterCodeSuccess:
        "Codul de verificare a fost trimis. Vă rugăm să verificați inbox-ul.",
      sendRegisterCodeFailed: "Nu s-a putut trimite codul de verificare",
      backToLoginWithAccount: "Aveți deja un cont? Autentificați-vă",
      forgotPassword: "Ați uitat parola?",
      forgotPasswordPageTitle: "Resetați Parola",
      forgotPasswordPageSubtitle:
        "Resetați-vă parola de autentificare cu e-mailul înregistrat și codul de verificare.",
      forgotPasswordPrompt: "Ați uitat parola?",
      forgotPasswordAction: "Recuperați-o",
      forgotPasswordDesc:
        "După verificarea e-mailului cu un cod, puteți seta direct o nouă parolă de autentificare.",
      forgotPasswordHint:
        "Introduceți e-mailul înregistrat, codul de verificare și o nouă parolă. Vă puteți autentifica cu noua parolă imediat după trimitere.",
      goToOtpLogin: "Utilizați Autentificare cu Cod E-mail",
      resetCode: "Cod de Recuperare",
      sendResetCode: "Trimiteți Cod de Recuperare",
      sendResetCodeSuccess:
        "Codul de recuperare a fost trimis. Vă rugăm să verificați inbox-ul.",
      sendResetCodeFailed: "Nu s-a putut trimite codul de recuperare",
      resetPassword: "Resetați Parola",
      resetPasswordSuccess:
        "Parola a fost resetată cu succes. Vă rugăm să vă autentificați cu noua parolă.",
      resetPasswordFailed: "Nu s-a putut reseta parola",
      newPassword: "Parolă Nouă",
      confirmNewPassword: "Confirmați Parola Nouă",
      newPasswordPlaceholder: "Introduceți o parolă cu cel puțin 8 caractere",
      confirmPassword: "Confirmați Parola",
      confirmPasswordPlaceholder: "Introduceți parola din nou",
      backToLogin: "Înapoi la Autentificare",
      emailRequired: "Introduceți e-mailul",
      passwordRequired: "Introduceți parola",
      otpCodeRequired: "Introduceți codul de verificare prin e-mail",
      phoneRequired: "Introduceți numărul de telefon",
      phoneOtpCodeRequired: "Introduceți codul de verificare SMS",
      emailInvalid: "Introduceți o adresă de e-mail validă",
      resetCodeRequired: "Introduceți codul de recuperare",
      resetCodePlaceholder: "Introduceți codul de recuperare de 6 cifre",
      newPasswordRequired: "Introduceți o parolă nouă",
      confirmNewPasswordRequired: "Confirmați din nou parola nouă",
      newPasswordMinLength: "Parola nouă trebuie să aibă cel puțin 8 caractere",
      passwordMinLength: "Parola trebuie să aibă cel puțin 8 caractere",
      newPasswordMismatch: "Cele două parole noi nu se potrivesc",
      passwordMismatch: "Cele două parole nu se potrivesc",
      registrationClosed: "Înregistrarea este momentan închisă",
      login: "Autentificare",
      passkeyLogin: "Passkey",
      passkeyLoginDesc:
        "Utilizați un passkey deja legat de acest site pe dispozitivul sau contul de sistem.",
      passkeyLoginButton: "Utilizați Passkey",
      passkeyLoginHint:
        "Trebuie să legați un passkey în centrul de cont înainte de a-l utiliza aici.",
      passkeyLoginSuccess: "Passkey adăugat cu succes",
      passkeyNotAvailable:
        "Nu există passkey disponibil pentru acest site pe acest dispozitiv. Utilizați o altă metodă de autentificare.",
      qrLogin: "Autentificare cu QR",
      qrLoginDesc: "Autentificați-vă scanând codul QR cu aplicația MySSO.",
      qrLoginScanned: "Cod QR scanat. Confirmați autentificarea în aplicație.",
      qrLoginScannedMask: "Acest cod QR a fost scanat",
      qrLoginCancelled: "Autentificarea QR a fost anulată",
      qrLoginExpired: "Codul QR a expirat. Reîmprospătați.",
      qrLoginRefresh: "Reîmprospătați codul QR",
      passwordLogin: "Parolă",
      otpLogin: "Cod E-mail",
      phoneOtpLogin: "Cod Telefon",
      email: "E-mail",
      phone: "Număr de Telefon",
      password: "Parolă",
      otpCode: "Cod E-mail",
      phoneOtpCode: "Cod SMS",
      mfaCode: "Cod 2FA",
      mfaPlaceholder: "Lăsați gol dacă autentificarea cu doi factori nu este activată",
      sendOtpCode: "Trimiteți Cod E-mail",
      sendOtpCodeSuccess:
        "Codul prin e-mail a fost trimis. Vă rugăm să verificați inbox-ul.",
      sendOtpCodeFailed: "Nu s-a putut trimite codul de verificare",
      sendOtpCodeEmailRequired: "Introduceți e-mailul înainte de a solicita un cod",
      sendPhoneOtpCode: "Trimiteți Cod SMS",
      sendPhoneOtpCodeSuccess:
        "Codul SMS a fost trimis. Vă rugăm să verificați telefonul.",
      sendPhoneOtpCodeFailed: "Nu s-a putut trimite codul SMS",
      sendPhoneBindingCode: "Trimiteți Cod de Legare",
      sendPhoneBindingCodeSuccess:
        "Codul de legare a telefonului a fost trimis. Vă rugăm să verificați telefonul.",
      sendPhoneBindingCodeFailed: "Nu s-a putut trimite codul de legare a telefonului",
      securityCaptcha: "Verificare de Securitate",
      securityCaptchaPlaceholder:
        "Introduceți valoarea de verificare de securitate și încercați din nou",
      securityCaptchaHelp:
        "Când dispozitivul sau IP-ul curent trimite solicitări prea frecvent, completați această verificare de securitate înainte de a solicita un alt cod.",
      securityCaptchaRequiredTip:
        "Volumul de solicitări este mare. Completați verificarea de securitate înainte de a solicita un alt cod.",
      sendOtpCodePhoneRequired:
        "Introduceți numărul de telefon înainte de a solicita un cod",
      phoneBindingPageTitle: "Leagă Număr de Telefon",
      phoneBindingRegisterDesc:
        "Acest cont a atins regula de risc după înregistrare. Leagă un număr de telefon înainte de a continua.",
      phoneBindingLoginDesc:
        "Acest cont a declanșat regula de risc la autentificare. Leagă un număr de telefon înainte de a continua.",
      completePhoneBinding: "Leagă și Continuă",
      phoneBindingSuccess:
        "Numărul de telefon a fost legat cu succes. Contul este activ din nou.",
      mfaVerifyTitle: "Verificare cu Doi Factori",
      mfaVerifyEmailHint:
        "Un cod de verificare a fost trimis la {{target}}. Introduceți-l pentru a continua autentificarea.",
      mfaVerifyPhoneHint:
        "Un cod de verificare a fost trimis la {{target}}. Introduceți-l pentru a continua autentificarea.",
      loginStepUpTitle: "Verificare Suplimentară de Autentificare",
      loginStepUpEmailDesc:
        "Această autentificare necesită o verificare suplimentară prin e-mail. Un cod va fi trimis la {{email}}.",
      loginStepUpSMSDesc:
        "Această autentificare necesită o verificare suplimentară prin telefon. Un cod va fi trimis la {{phone}}.",
      loginStepUpDualDesc:
        "Această autentificare necesită atât verificare prin e-mail, cât și prin telefon. E-mail: {{email}}, telefon: {{phone}}.",
      loginStepUpExpired:
        "Sesiunea de verificare suplimentară de autentificare a expirat. Vă rugăm să vă autentificați din nou.",
      forcedMfaEnrollmentTitle: "Autentificarea cu Doi Factori Trebuie Activată",
      forcedMfaEnrollmentDesc:
        "Un administrator cere ca acest cont să activeze autentificarea cu doi factori înainte ca această autentificare să se poată termina.",
      forcedMfaEnrollmentExpired:
        "Sesiunea de înscriere forțată MFA a expirat. Vă rugăm să vă autentificați din nou.",
      completeForcedMfaEnrollment: "Activați și Continuați",
      cancelForcedMfaEnrollment: "Anulați și Reveniți la Autentificare",
      verifyAndLogin: "Verificați și Autentificați-vă",
      deletionConfirmTitle: "Solicitare de Ștergere a Contului Trimisă",
      deletionConfirmScheduledAt: "Timpul programat pentru ștergere: {{date}}",
      deletionConfirmDesc:
        "Autentificarea din nou va anula ștergerea.",
      deletionConfirmContinue: "Continuați și Anulați Ștergerea",
      deletionConfirmExpired: "Confirmarea a expirat, vă rugăm să vă autentificați din nou",
      deletionConfirmFailed: "Confirmarea a eșuat, vă rugăm să vă autentificați din nou",
      logoutProgressTitle: "Se deconectează",
      logoutProgressDesc:
        "Sesiunea de identitate a fost ștearsă și aplicațiile conectate se deconectează.",
      loginFailed: "Autentificare eșuată",
      oidcCallbackFailed: "Callback OIDC Eșuat",
      appRejected: "Aplicație Respinsă",
      appRejectedWithReason: "Aplicație Respinsă: {{reason}}",
      appNotFound: "Aplicația Nu a Fost Găsită",
      accessDenied: "Acces Interzis",
      tokenExchangeFailed: "Schimbul de token a eșuat",
      authorize: {
        title: "Utilizați {{siteName}} pentru a vă autentifica în {{appName}}",
        desc: "Această aplicație solicită următoarele informații și permisiuni. După confirmare, veți reveni la aplicația de afaceri pentru a finaliza autentificarea.",
        chooseAccountTitle: "Sunteți deja autentificat în {{siteName}}",
        chooseAccountDesc:
          "Alegeți dacă doriți să continuați cu contul curent sau să vă autentificați mai întâi cu un alt cont.",
        currentAccountFallback: "Contul curent",
        useCurrentAccount: "Continuați cu acest cont",
        useAnotherAccount: "Autentificați-vă cu alt cont",
        permissionTitle: "Permisiuni solicitate",
        permissionCount: "{{count}} elemente",
        agreement:
          "Am citit și sunt de acord să acord permisiunile listate mai sus",
        confirm: "Confirmați și Continuați",
        cancel: "Anulați și Reveniți la Autentificare",
        errors: {
          applicationDisabled: "Aplicație dezactivată",
          applicationRejected: "Aplicație respinsă",
          applicationRejectedWithReason: "Aplicație respinsă: {{reason}}",
          applicationAccessRestricted: "Acces la aplicație restricționat",
          applicationAccessBanned: "Acces la aplicație interzis",
          applicationAccessBannedWithReason: "Acces la aplicație interzis: {{reason}}",
          applicationNotApproved: "Aplicație neaprobată",
          applicationNotFound: "Aplicație negăsită",
          forbidden: "Nu aveți permisiunea de a accesa această aplicație",
          unsupportedResponseType: "Tip de răspuns necunoscut",
          redirectUriMismatch: "URI de redirecționare neconcordant",
          scopeNotAllowed: "Scopul solicitat nu este permis",
          openidScopeRequired: "Scopul openid este necesar",
          codeChallengeMethodRequiresCodeChallenge: "Un code challenge este necesar când code_challenge_method este furnizată",
          unsupportedCodeChallengeMethod: "Metodă de code challenge necunoscută",
          promptNoneMustNotBeCombinedWithOtherValues: "Valoarea none a parametrului prompt nu poate fi combinată cu alte valori",
          invalidMaxAge: "Valoare max_age invalidă",
          acrValuesNotSatisfied: "Sesiunea curentă de autentificare nu satisface cerințele de context de autentificare solicitate",
          consentRequired: "Este necesar un consimțământ suplimentar",
          loginRequired: "Vă rugăm să vă autentificați din nou pentru a continua",
          authorizeFailed: "Autorizarea a eșuat. Vă rugăm să încercați din nou.",
          loadAuthorizationSettingsFailed: "Încărcarea setărilor de autorizare a eșuat",
          networkRequestFailed: "Solicitarea de rețea a eșuat. Verificați conexiunea și încercați din nou.",
          apiReturnedHtml: "Serviciul de autorizare a returnat o pagină neașteptată. Verificați configurația API sau proxy-ului invers.",
        },
        scopes: {
          openidTitle: "Confirmați-vă identitatea",
          openidDesc:
            "Utilizat pentru a verifica dacă contul autentificat curent vă aparține și pentru a stabili sesiunea de autentificare de bază.",
          profileTitle: "Accesați profilul dvs. public",
          profileDesc:
            "Include numele dvs. de afișare, avatarul și date similare de profil public pentru prezentarea în aplicație.",
          emailTitle: "Accesați informațiile dvs. de e-mail",
          emailDesc:
            "Utilizat pentru a afișa e-mailul contului dvs. sau pentru a susține notificări și legarea contului atunci când este necesar.",
          phoneTitle: "Accesați numărul dvs. de telefon",
          phoneDesc:
            "Utilizat pentru recunoașterea contului, notificări sau verificare de securitate atunci când este necesar.",
          gatewayReadTitle: "Accesați API-urile de afaceri protejate",
          gatewayReadDesc:
            "Permite aplicației să acceseze resurse protejate ca identitatea dvs. autorizată.",
          customTitle: "Se solicită permisiunea: {{scope}}",
          customDesc:
            "Această aplicație solicită o permisiune de afaceri suplimentară. Revizuiți-o cu atenție înainte de a continua.",
        },
      },
      sessionConflict: {
        title: "Au fost detectate conturi diferite în acest browser",
        desc: "Contul memorat de această fereastră nu se potrivește cu contul activ curent al browserului. Doar un cont principal poate rămâne activ în același browser în același timp. Alegeți cu ce cont să continuați.",
        browserAccount: "Contul activ al browserului",
        thisWindowAccount: "Contul anterior al acestei ferestre",
        useBrowserAccount: "Utilizați contul activ al browserului",
        useThisWindowAccount: "Reveniți la contul acestei ferestre",
        relogin: "Deconectați-vă și autentificați-vă din nou",
      },
    },
    nav: {
      security: "Autentificare și Securitate",
      profile: "Profil",
      privacy: "Centrul de Confidențialitate",
      bindings: "Aplicații Autorizate",
      help: "Centrul de Ajutor",
    },
    common: {
      loadingFailed: "Încărcarea a eșuat",
      revokeFailed: "Revocarea consimțământului a eșuat",
      revokeSuccess: "Consimțământ revocat",
      confirm: "Confirmați",
      sendCode: "Trimiteți Cod",
      sendCodeSuccess: "Cod de verificare trimis cu succes",
      sendingCode: "Se trimite",
      save: "Salvați",
      saving: "Se salvează",
      edit: "Editați",
      cancel: "Anulați",
      uploadAvatar: "Încărcați Avatar",
      avatarUpdated: "Avatar actualizat",
      avatarUploadFailed: "Încărcarea avatarului a eșuat",
      profileUpdated: "Profil actualizat",
      profileUpdateFailed: "Actualizarea profilului a eșuat",
      imageReadFailed: "Citirea imaginii a eșuat",
      imageProcessUnsupported:
        "Procesarea imaginii nu este acceptată în acest browser",
      avatarConvertFailed: "Conversia avatarului a eșuat",
      unset: "Nesetat",
      unsetShort: "Nesetat",
      notFilled: "Nu este furnizat",
      noRecord: "Fără înregistrări",
      normal: "Activ",
      accountCenter: "Centrul Contului",
      noAuthorizedApps: "Nu există aplicații autorizate",
    },
    errors: {
      emailRequiredByServer: "Vă rugăm să introduceți e-mailul",
      passwordRequiredByServer: "Vă rugăm să introduceți parola",
      invalidCredentials: "Cont sau acreditări incorecte",
      invalidOtpCode: "Codul de verificare este invalid sau a expirat",
      accountFrozen: "Acest cont a fost înghețat",
      accountFrozenWithReason:
        "Acest cont a fost înghețat. Motiv: {{reason}}",
      userNotFound: "Utilizatorul nu a fost găsit",
      smsNotConfigured: "Trimiterea SMS nu este configurată",
      smtpNotConfigured: "Trimiterea e-mail nu este configurată",
      userStatusInvalid:
        "Starea curentă a contului nu permite această acțiune",
      invalidCurrentPhoneVerificationCode:
        "Codul de verificare al telefonului curent este invalid sau a expirat",
      invalidNewPhoneVerificationCode:
        "Codul de verificare al telefonului nou este invalid sau a expirat",
      currentPhoneVerificationCodeRequired:
        "Introduceți codul de verificare al telefonului curent",
      currentPhoneNotBound:
        "Niciun număr de telefon nu este legat în prezent de acest cont",
      phoneDoesNotMatchCurrentBoundPhone:
        "Numărul de telefon nu se potrivește cu cel legat în prezent",
      phoneAlreadyBound: "Acest număr de telefon este deja legat",
      newPhoneMustBeDifferent:
        "Numărul de telefon nou trebuie să fie diferit de cel curent",
      phoneAndVerificationCodeRequired:
        "Introduceți numărul de telefon și codul de verificare al telefonului nou",
      invalidMfaCode: "Codul de verificare cu doi factori este invalid sau a expirat",
      unsupportedMfaMethod: "Metodă de autentificare cu doi factori nesuportată",
      mfaNotEnabled:
        "Autentificarea cu doi factori nu este activată pentru acest cont",
      emailNotBound: "Niciun e-mail nu este legat de acest cont",
      phoneNotBound: "Niciun număr de telefon nu este legat de acest cont",
      emailVerificationCodeRequired: "Introduceți codul de verificare prin e-mail",
      invalidEmailVerificationCode:
        "Codul de verificare prin e-mail este invalid sau a expirat",
      phoneVerificationCodeRequired: "Introduceți codul de verificare prin telefon",
      invalidPhoneVerificationCode:
        "Codul de verificare prin telefon este invalid sau a expirat",
      newPasswordMustBeDifferentFromCurrentPassword:
        "Parola nouă trebuie să fie diferită de parola curentă",
      phoneBindingChallengeExpired:
        "Sesiunea de legare a telefonului a expirat. Vă rugăm să vă autentificați sau să vă înregistrați din nou.",
      manualMfaCodeNotSendable:
        "Acest cont folosește un cod MFA manual și nu poate trimite un cod",
      emailAndPasswordRequired:
        "Introduceți e-mailul și parola înainte de a solicita un cod cu doi factori",
      mfaChallengeExpiredOrInvalid:
        "Sesiunea de verificare cu doi factori a expirat. Vă rugăm să vă autentificați din nou.",
      challengeRequired:
        "Finalizați provocarea de securitate înainte de a solicita un cod.",
      captchaRequired:
        "Volumul de solicitări este mare. Finalizați verificarea de securitate mai întâi.",
      circuitOpen:
        "Canalul de livrare este temporar protejat. Vă rugăm să încercați mai târziu.",
      cooldownActive:
        "Această țintă a solicitat coduri prea frecvent. Vă rugăm să încercați mai târziu.",
      passkeyChallengeExpired: "Sesiunea passkey a expirat. Vă rugăm să încercați din nou.",
      passkeyVerificationFailed:
        "Verificarea passkey a eșuat. Încercați din nou sau utilizați o altă metodă de autentificare.",
      passkeyAlreadyExists: "Acest passkey este deja legat.",
      passkeyNotFound: "Passkey negăsit.",
      passkeyBrowserUnsupported:
        "Acest browser sau dispozitiv nu acceptă passkeys.",
      passkeyUserHandleInvalid:
        "Contul pentru acest passkey nu a putut fi identificat.",
      invalidLoginStepUpVerificationCode:
        "Codul de verificare suplimentar este invalid sau a expirat.",
      loginStepUpChallengeExpiredOrInvalid:
        "Sesiunea de verificare suplimentară a expirat. Vă rugăm să vă autentificați din nou.",
      mfaEnrollmentChallengeExpiredOrInvalid:
        "Sesiunea de înscriere forțată MFA a expirat. Vă rugăm să vă autentificați din nou.",
      noAvailableMfaMethodForCurrentAccount:
        "Nu este disponibilă nicio metodă MFA pentru acest cont.",
      noAvailableLoginVerificationTargetForCurrentAccount:
        "Nu este disponibilă nicio țintă de verificare suplimentară pentru acest cont.",
    },
    security: {
      loginMethods: "Metode de Autentificare",
      phone: "Leagă Număr de Telefon",
      phoneDesc:
        "Utilizat pentru metode de autentificare suplimentare, verificare SMS și notificări de securitate ale contului",
      bindPhone: "Leagă",
      bindPhoneTitle: "Leagă Număr de Telefon",
      bindPhoneHint:
        "Verificați numărul de telefon mai întâi înainte de a-l lega. Codul de verificare va fi trimis la acest număr de telefon.",
      rebindPhoneHint:
        "Pentru a înlocui numărul de telefon legat, verificați mai întâi numărul de telefon curent și apoi verificați cel nou.",
      currentPhone: "Număr de Telefon Legat în Prezent",
      currentPhoneCode: "Cod de Verificare al Telefonului Curent",
      currentPhoneCodePlaceholder:
        "Introduceți codul de 6 cifre trimis la numărul de telefon curent",
      sendCurrentPhoneCode: "Trimiteți Codul Telefonului Curent",
      newPhone: "Număr de Telefon",
      newPhoneCode: "Cod de Verificare al Telefonului Nou",
      newPhonePlaceholder: "Introduceți un număr de telefon, de exemplu 13800138000",
      smsCode: "Cod de Verificare SMS",
      smsCodePlaceholder: "Introduceți codul SMS de 6 cifre",
      safeEmail: "E-mail Securizat",
      safeEmailDesc: "Acreditare principală utilizată pentru autentificare",
      editEmailTitle: "Schimbați E-mailul Securizat",
      newEmail: "E-mail Nou",
      newEmailPlaceholder: "Introduceți noua adresă de e-mail",
      emailCode: "Cod E-mail",
      emailCodePlaceholder: "Introduceți codul de 6 cifre",
      changeEmailHint:
        "Noul e-mail trebuie verificat înainte ca modificarea să fie salvată.",
      changePassword: "Schimbați Parola",
      changePasswordDesc:
        "Actualizați-vă periodic parola de autentificare pentru a îmbunătăți securitatea contului",
      editPasswordTitle: "Schimbați Parola de Autentificare",
      currentPassword: "Parola Curentă",
      currentPasswordPlaceholder: "Introduceți parola curentă",
      currentPasswordIncorrect: "Parola curentă este incorectă",
      newPassword: "Parolă Nouă",
      newPasswordPlaceholder: "Introduceți o nouă parolă cu cel puțin 8 caractere",
      confirmPassword: "Confirmați Parola Nouă",
      confirmPasswordPlaceholder: "Introduceți din nou noua parolă",
      changePasswordHint:
        "Utilizați noua parolă data viitoare când vă autentificați și evitați să reutilizați vechea parolă.",
      passwordMinLength: "Parola trebuie să aibă cel puțin 8 caractere",
      passwordMismatch: "Cele două parole noi nu se potrivesc",
      passwordUpdated: "Parola a fost actualizată",
      passwordUpdateFailed: "Actualizarea parolei a eșuat",
      mfa: "Autentificare cu Doi Factori",
      mfaDesc: "Când este activată, este necesară o verificare suplimentară în timpul autentificării",
      mfaTitle: "Configurați Autentificarea cu Doi Factori",
      mfaHint: "Alegeți metoda de verificare secundară utilizată în timpul autentificării.",
      mfaTitleEnable: "Activați Autentificarea cu Doi Factori",
      mfaTitleDisable: "Dezactivați Autentificarea cu Doi Factori",
      mfaHintEnable:
        "Alegeți metoda de verificare secundară utilizată în timpul autentificării.",
      mfaHintDisable:
        "După dezactivare, nu va mai fi necesară o verificare suplimentară în timpul autentificării.",
      mfaMethod: "Metodă de Verificare",
      mfaMethodEmail: "Cod E-mail",
      mfaMethodSMS: "Cod Telefon",
      passkeys: "Passkeys",
      passkeysDesc:
        "După legare, vă puteți autentifica direct din selectorul de passkey al sistemului.",
      addPasskey: "Adăugați Passkey",
      deletePasskey: "Ștergeți Passkey",
      passkeyName: "Nume Dispozitiv",
      passkeyNamePlaceholder: "Introduceți un nume recognoscibil",
      passkeyLastUsed: "Ultima utilizare",
      passkeyLastUsedIP: "Ultimul IP utilizat",
      passkeyCreatedAt: "Creat la",
      passkeyEmpty: "Nu există passkeys legate",
      passkeyManageVerify:
        "Pentru a vă proteja contul, verificați acreditările curente înainte de a adăuga sau șterge un passkey.",
      currentMfaCode: "Cod MFA Curent",
      currentMfaCodePlaceholder: "Introduceți codul din metoda MFA curentă",
      currentMfaCodeHintEmail:
        "Finalizați verificarea cu codul de e-mail curent legat înainte de a salva.",
      currentMfaCodeHintSMS:
        "Finalizați verificarea cu codul de telefon curent legat înainte de a salva.",
      currentMfaCodeHintManual:
        "Introduceți codul MFA manual configurat în prezent înainte de a salva.",
      accountSecurity: "Securitatea Contului",
      recentLogin: "Autentificare Recentă",
      recentLoginDesc: "Ultimul timp de autentificare reușit și IP-ul dispozitivului",
    },
    profile: {
      title: "Profil",
      avatar: "Avatar",
      avatarDesc:
        "Imaginea va fi decupată automat la centru și convertită în format webp",
      nickname: "Pseudonim",
      nicknameDesc: "Numele de afișare curent",
      gender: "Gen",
      genderDesc: "Informații despre genul profilului pentru acest cont",
      languagePreference: "Preferință Lingvistică",
      languagePreferenceDesc:
        "După autentificare, această limbă va fi utilizată mai întâi pentru conținutul paginii",
      languagePreferenceSaved: "Preferința lingvistică a fost salvată",
      languagePreferenceSaveFailed: "Salvarea preferinței lingvistice a eșuat",
      genderMale: "Masculin",
      genderFemale: "Feminin",
      genderOther: "Altul",
      userId: "ID Utilizator",
      userIdDesc: "Identificator unic al contului curent în sistem",
      nicknamePlaceholder: "Introduceți pseudonimul",
      editNicknameTitle: "Editați Pseudonimul",
      editGenderTitle: "Editați Genul",
      email: "Adresă de E-mail",
      emailDesc: "Utilizat pentru autentificare, verificare și notificări de securitate",
      createdAt: "Înregistrat La",
      createdAtDesc: "Timpul când a fost creat acest cont",
      country: "Țara de Înregistrare",
      countryDesc: "Țara sau regiunea înregistrată la înregistrare",
    },
    privacy: {
      title: "Centrul de Confidențialitate",
      exportTitle: "Descărcați Datele Utilizatorului",
      exportDesc:
        "Exportați datele de profil și aplicațiile autorizate nerevocate în format CSV.",
      exportAction: "Descărcați Datele",
      exportPasswordVerifyDesc:
        "Verificați parola curentă de autentificare înainte de a descărca. CSV-ul va include datele de profil și aplicațiile autorizate nerevocate.",
      exportSuccess: "Descărcarea datelor utilizatorului a început",
      exportFailed: "Exportarea datelor utilizatorului a eșuat",
      minimizeTitle: "Minimizarea Datelor",
      minimizeDesc:
        "Sistemul păstrează numai țara de înregistrare, e-mailul, consimțămintele și datele esențiale de securitate la autentificare.",
      scopeTitle: "Domeniul de Acces Curent",
      scopeDesc:
        "Puteți revizui aplicațiile care au accesat contul dvs. în Aplicații Autorizate și le puteți revoca în orice moment.",
      statusTitle: "Starea Contului",
      statusDesc:
        "Dacă contul este înghețat, autentificarea va fi blocată până când un administrator o rezolvă.",
      deleteTitle: "Ștergeți Contul",
      deleteDesc:
        "Dacă vă autentificați din nou în termen de 7 zile, solicitarea de ștergere este anulată automat. În caz contrar, contul și datele de consimțământ vor fi eliminate.",
      deleteWarningPrimary:
        "Ștergerea contului este ireversibilă. Vă rugăm să faceți backup oricăror date legate de acest cont mai întâi.",
      deleteWarningSecondary:
        "După ce solicitarea este trimisă, autentificarea din nou în termen de 7 zile anulează ștergerea. Dacă nu vă autentificați în termen de 7 zile, sistemul șterge automat contul și datele de consimțământ.",
      deleteAction: "Am Citit și Accept Consecințele",
      passwordVerifyTitle: "Verificați Parola Curentă",
      passwordVerifyDesc:
        "Introduceți parola curentă de autentificare și finalizați verificarea prin e-mail. Dacă este legat un număr de telefon, este necesară și verificarea prin telefon.",
      emailVerifyCode: "Cod de Verificare E-mail",
      emailVerifyCodePlaceholder: "Introduceți codul de 6 cifre trimis la e-mailul dvs.",
      sendDeleteEmailCode: "Trimiteți Cod E-mail",
      sendDeleteEmailCodeSuccess:
        "Codul de verificare prin e-mail a fost trimis. Vă rugăm să verificați inbox-ul.",
      sendDeleteEmailCodeFailed: "Nu s-a putut trimite codul de verificare prin e-mail",
      phoneVerifyCode: "Cod de Verificare Telefon",
      phoneVerifyCodePlaceholder: "Introduceți codul de 6 cifre trimis la telefonul dvs.",
      sendDeletePhoneCode: "Trimiteți Cod Telefon",
      sendDeletePhoneCodeSuccess:
        "Codul de verificare prin telefon a fost trimis. Vă rugăm să verificați telefonul.",
      sendDeletePhoneCodeFailed: "Nu s-a putut trimite codul de verificare prin telefon",
      confirmDeleteNow: "Trimiteți Solicitarea de Ștergere",
      deleteSuccess:
        "Solicitarea de ștergere a fost trimisă. Autentificarea în termen de 7 zile o va anula.",
      deleteFailed: "Nu s-a putut trimite solicitarea de ștergere",
      deletePendingAt:
        "Solicitarea de ștergere a fost trimisă. Timpul programat pentru ștergere: {{date}}",
    },
    bindings: {
      title: "Aplicații Autorizate",
      appId: "Nume Aplicație",
      scopes: "Domenii",
      createdAt: "Autorizat La",
      authorizedAt: "Autorizat La",
      status: "Stare",
      action: "Acțiune",
      viewDetails: "Detalii",
      detailTitle: "Detalii Autorizare",
      siteName: "Site Autorizat",
      requestedPermissions: "Permisiuni Acordate",
      accessStatus: "Stare Acces",
      reason: "Motiv",
      effectiveAt: "Data Intrării în Vigoare",
      expiresAt: "Data Expirării",
      accessStatusNormal: "Activ",
      accessStatusRestricted: "Restricționat",
      accessStatusBanned: "Blocat",
      scopeOpenIdTitle: "Confirmați-vă identitatea",
      scopeOpenIdDesc:
        "Utilizat pentru a confirma că contul autentificat sunteți chiar dvs. și pentru a stabili sesiunea de autentificare de bază.",
      scopeProfileTitle: "Accesați profilul dvs. public",
      scopeProfileDesc:
        "Include pseudonimul, avatarul și alte date de profil public pentru afișare în aplicație.",
      scopeEmailTitle: "Accesați adresa dvs. de e-mail",
      scopeEmailDesc:
        "Utilizat pentru a afișa e-mailul contului sau pentru a trimite notificări și a lega contul când este necesar.",
      scopePhoneTitle: "Accesați numărul dvs. de telefon",
      scopePhoneDesc:
        "Utilizat pentru identificarea contului, notificări sau verificare de securitate când este necesar.",
      scopeGatewayReadTitle: "Accesați API-urile de afaceri protejate",
      scopeGatewayReadDesc:
        "Permite aplicației să acceseze resurse API protejate în numele dvs. după autorizare.",
      scopeCustomTitle: "Se solicită permisiunea: {{scope}}",
      scopeCustomDesc:
        "Această aplicație solicită o permisiune de afaceri suplimentară. Revizuiți-o cu atenție înainte de a continua.",
      revoke: "Revocați",
      batchRevoke: "Revocare în Masă",
      batchRevokeConfirmTitle: "Confirmați revocarea în masă?",
      batchRevokeConfirmDesc:
        "{{count}} autorizări sunt selectate. Aceste aplicații va trebui să solicite din nou consimțământul.",
    },
    help: {
      title: "Centrul de Ajutor",
      loginIssueTitle: "Nu se poate Autentifica",
      loginIssueDesc:
        "Dacă nu vă puteți autentifica, confirmați mai întâi că utilizați metoda corectă pentru cont, cum ar fi parola, codul de e-mail, codul de telefon sau passkey. Dacă un cod de verificare este respins, asigurați-vă că este cel mai recent și încă în perioada de valabilitate. Dacă contul este afișat ca fiind înghețat, în așteptarea activării sau altfel restricționat, problema trebuie gestionată de un administrator al platformei. Dacă ați trimis recent o solicitare de ștergere a contului, sistemul poate solicita, de asemenea, confirmarea ștergerii sau legarea telefonului înainte ca accesul să fie restabilit.",
      protectTitle: "Protejați-vă Contul",
      protectDesc:
        "Activați autentificarea cu doi factori cât mai curând posibil și legați passkeys pe dispozitivele de încredere pentru a reduce riscul de compromitere prin parolă. Nu partajați niciodată coduri de e-mail, coduri SMS sau coduri MFA cu terțe părți și nu reintroduceți acreditări pe pagini în care nu aveți încredere. Dacă utilizați același cont pe mai multe dispozitive, revizuiți în mod regulat autentificările recente, passkeys legate și aplicațiile autorizate și eliminați dispozitivele sau autorizațiile pe care nu le mai utilizați.",
      authIssueTitle: "Probleme de Autorizare",
      authIssueDesc:
        "Dacă o aplicație pare necunoscută, solicită domenii neobișnuite sau suspectați că își abuzează contul, deschideți Aplicații Autorizate pentru a revizui timpul de autorizare, domeniile acordate și detaliile de integrare ale acesteia, apoi revocați-o imediat dacă este necesar. După revocare, aplicația nu va mai putea accesa resursele protejate cu contul dvs. până când nu vă autentificați din nou și aprobați o nouă solicitare de consimțământ. Dacă problema poate afecta întregul cont mai degrabă decât o singură aplicație, ar trebui să vă schimbați și parola, să verificați setările MFA și să revizuiți activitatea recentă de autentificare și passkey.",
      contactTitle: "Contactați-ne",
      contactDesc:
        "Dacă aveți nevoie de asistență manuală, puteți contacta suportul platformei de mai jos. Atunci când raportați o problemă, includeți e-mailul contului, ora la care a apărut problema, capturi de ecran ale mesajelor de eroare, metoda de autentificare pe care o utilizați și detalii relevante despre dispozitiv sau browser, astfel încât problema să poată fi investigată mai rapid.",
      contactMainlandTitle: "China Continentală",
      contactOverseasTitle: "Străinătate",
      contactPersonLabel: "Persoană de contact:",
      contactPhoneLabel: "Telefon:",
      contactEmailLabel: "E-mail:",
      contactHoursLabel: "Ore de suport:",
      contactMainlandPersonValue: "YOUR_NAME",
      contactMainlandPhoneValue: "YOUR_PHONE_NUMBER",
      contactMainlandEmailValue: "YOUR_EMAIL",
      contactMainlandHoursValue: "Luni până Vineri 09:00 - 18:00",
      contactOverseasPersonValue: "De furnizat",
      contactOverseasPhoneValue: "De furnizat",
      contactOverseasEmailValue: "De furnizat",
      contactOverseasHoursValue: "Luni până Vineri 09:00 - 18:00",
      contactRegionNotice:
        "Vă rugăm să contactați mai întâi canalul de suport pentru regiunea dvs. Dacă nu sunteți sigur care regiune se aplică, începeți cu contactul pentru China Continentală pentru ajutor la direcționare.",
      contactNotice:
        "Pentru probleme precum conturi înghețate, autorizări anormale, passkeys pierdute sau recuperare după ștergere, contactați mai întâi administratorul prin numărul de telefon sau e-mailul de mai sus. Dacă platforma dvs. oferă un sistem oficial de bilete, panou de anunțuri sau grup de operațiuni, urmați mai întâi acel canal oficial.",
    },
  },
} as const;

export default locale;
