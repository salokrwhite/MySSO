const locale = {
  translation: {
    header: {
      language: "Nyelv váltása",
      languageModalTitle: "Nyelv kiválasztása",
      languageModalDesc: "Válassza ki a felület nyelvét.",
      agreement: "Felhasználói szerződés",
      privacy: "Adatvédelmi irányelvek",
      help: "Segítségközpont",
      logout: "Kijelentkezés",
      accountCenter: "Fiókközpont",
    },
    legal: {
      back: "Vissza a főoldalra",
      updatedAt: "Utoljára frissítve: {{date}}",
      agreement: {
        title: "Felhasználói szerződés",
        updatedAt: "2026-03-16",
        intro:
          "Üdvözöljük a {{siteName}} oldalon. Regisztráció, bejelentkezés, integráció vagy a egységes azonosítási szolgáltatások használata előtt olvassa figyelmesen ezt a szerződést. A szolgáltatás további használatával elfogadja ezt a szerződést.",
        sections: {
          accountTitle: "1. Fiók és bejelentkezés",
          accountP1:
            "Igaz, jogszerű és elérhető regisztrációs adatokat kell megadnia, és gondosan kell őriznie a fiókját, jelszavát, hitelesítő kódokat és egyéb bejelentkezési adatait. Ön felelős az Ön oldaláról származó hitelesítő adatok rossz kezeléséből származó veszteségekért.",
          accountP2:
            "Ha rendellenes bejelentkezési tevékenységet, szabálytalanságot, fagyott állapotot vagy biztonsági kockázatot észlelnek, a platform biztonsági okokból további ellenőrzést igényelhet, korlátozhatja a bejelentkezést vagy felfüggesztheti a hozzáférést.",
          acceptableUseTitle: "2. Elfogadható használat",
          acceptableUseP1:
            "Nem használhatja ezt a rendszert semmilyen jogellenes tevékenységre, jogsértésre, hitelesítési felületek visszaélésére, tömeges kérésekre, hitelesítő adatok töltésére vagy a platform stabilitását veszélyeztető vagy biztonsági vezérlőket kikerülő tevékenységre.",
          acceptableUseP2:
            "Ha megszegi ezt a szerződést vagy a kapcsolódó szabályokat, a platform felfüggesztheti vagy leállíthatja a hozzáférésének egy részét vagy egészét, és fenntartja a szükséges esetekben a felelősség betöltésének jogát.",
          authorizationTitle: "3. Engedélyezés és harmadik felek",
          authorizationP1:
            "Ha {{siteName}} fiókkal jelentkezik be harmadik féle alkalmazásba, a rendszer az engedélyezési oldalon megjelenő engedélyek alapján kéri az Ön beleegyezését. Bármikor visszavonhatja ezt a beleegyezést a fiókközpontban.",
          authorizationP2:
            "A harmadik féle alkalmazások által az engedélyezés után végzett adatok használata az adott alkalmazás saját szolgáltatási feltételei és adatvédelmi irányelvei szerint szabályozott. A platform csak jogszabályok által megkövetelt hatáskörben vállal felelősséget.",
          developerTitle: "4. Fejlesztői integráció",
          developerP1:
            "A fejlesztőknek biztosítaniuk kell, hogy az alkalmazásinformációk, a visszairányítási URL-ek, a kért hatókörök és a üzleti célok igazak, teljesek és folyamatosan érvényesek legyenek, és ne csalják meg a felhasználókat.",
          developerP2:
            "A platform átvizsgálhatja, elutasíthatja, eltávolíthatja a listáról, törölheti vagy korlátozhatja a kapcsolódó alkalmazásokat, hogy megőrizze az egységes azonosítási ökoszisztéma biztonságát és integritását.",
          liabilityTitle: "5. Szolgáltatás módosításai és felelősség korlátozása",
          liabilityP1:
            "Biztonsági, jogi, operatív vagy karbantartási okokból a platform módosíthat, frissíthat, felfüggesztheti vagy leállíthat bizonyos felületeket, folyamatokat vagy funkciókat, és megpróbálja, amikor alkalmas, értesítést küldeni.",
          liabilityP2:
            "A jogszabályok által megengedett hatáskörben a platform nem vállal felelősséget a törvényi kötelezettségein túli megszakadt szolgáltatásokért, abnormális adatokért vagy a természeti katasztrófák, hálózati hibák, harmadik felek okai vagy Ön oldaláról származó helytelen használatból származó veszteségekért.",
        },
      },
      privacy: {
        title: "Adatvédelmi irányelvek",
        updatedAt: "2026-03-16",
        intro:
          "A {{siteName}} értékeli az Ön személyes adatait és fiók biztonságát. Ez az irányelv elmagyarázza, hogyan gyűjtjük, használjuk, tároljuk, osztjuk meg és védjük az Ön adatokat, valamint a számára elérhető jogokat.",
        sections: {
          dataCollectionTitle: "1. Gyűjtött adatok",
          dataCollectionP1:
            "Amikor regisztrál, jelentkezik be vagy használja a fiókszolgáltatásokat, gyűjthetjük a regisztrációs országát, e-mail címét, telefonszámát, jelszó kivonatát, bejelentkezési munkameneteket, eszköz IP-jét, engedélyezési rekordokat és szükséges biztonsági naplókat.",
          dataCollectionP2:
            "Amikor feltölt egy avatar képet, módosítja a profilját, köt ki egy telefonszámot, engedélyezi a kétlépcsős hitelesítést vagy engedélyezi egy harmadik féle alkalmazást, a funkció megadása érdekében a beadott adatokat feldolgozzuk.",
          dataUsageTitle: "2. Adatok használata",
          dataUsageP1:
            "A kapcsolódó adatokat a fiók regisztrálására, bejelentkezési hitelesítésre, hitelesítő kódok kiszállítására, kockázatkezelésre, engedélyezés megerősítésére, fejlesztői alkalmazások átvizsgálatára, fiók biztonsági értesítésekre és szolgáltatás megbízhatóságának fenntartására használjuk.",
          dataUsageP2:
            "Továbbá a naplókat és statisztikákat minimális szükség alapján elemzünk, hogy feltárjuk a rendellenes tevékenységeket, javítsuk a termék élményét és erősítsük a biztonságot.",
          dataSharingTitle: "3. Megosztás és nyilvánosságra hozatal",
          dataSharingP1:
            "Csak akkor biztosítunk személyazonosságra vonatkozó adatokat vagy engedélyekkel kapcsolatos adatokat harmadik féle alkalmazásoknak, ha explicit módon engedélyezi az engedélyezési oldalon megjelenő hatóköröket.",
          dataSharingP2:
            "A jogszabályok, szabályozói kérések, közérdekképezés vagy rendszerbiztonsági igények miatt szükséges kivételével nem áruljuk el, sem jogellenesen megosztjuk az Ön személyes adatait nem kapcsolódó harmadik felekkel.",
          userRightsTitle: "4. Jogai",
          userRightsP1:
            "Megtekintheti és frissítheti profilját, kötéseit, engedélyezési rekordjait és biztonsági beállításait a fiókközpontban, valamint visszavonhatja az alkalmazások engedélyeit vagy fiók törlési kérelmet küldhet.",
          userRightsP2:
            "Ha úgy gondolja, hogy adatai nem pontosak, helytelenül vannak feldolgozva vagy szükségtelenül kerülnek felhasználásra, kapcsolatba léphet a platform operátorával vagy gyakorolhatja alkalmazható jogszabályok szerinti jogait.",
          securityTitle: "5. Védelmezés és tárolás",
          securityP1:
            "Hozzáférés-vezérlést, jelszó kivonatolást, hitelesítő kódok lejárati idejét, naplózást és adatok minimalizálását használunk az Ön személyes adataival és hitelesítési adataival kapcsolatos védelem érdekében.",
          securityP2:
            "Jogszabályi és üzleti követelmények alapján csak a szolgáltatás céljainak megvalósításához szükséges időtartamra tároljuk az Ön adatokat; a fiók törlése vagy a tárolási időszak lejárta után a szabályok szerint töröljük vagy anonimizáljuk az adatokat.",
        },
      },
    },
    auth: {
      noAccount: "Nincs fiókja?",
      registerNow: "Regisztráció most",
      registerPageTitle: "Fiók létrehozása",
      registerPageSubtitle:
        "Fejezze be a regisztrációt országalapján, e-mail címmel és e-mail hitelesítő kóddal.",
      registerDisabled: "A regisztráció jelenleg letiltva van",
      registerSuccess:
        "Sikeres regisztráció. Kérjük, jelentkezzen be jelszavával.",
      phoneBindingRequiredAfterRegister:
        "Sikeres regisztráció. Kérjük, először kösse ki telefonszámot a fiók aktiválásához.",
      registerFailed: "Sikertelen regisztráció",
      country: "Ország",
      countryRequired: "Válasszon országot",
      registerCode: "E-mail kód",
      registerCodeRequired: "Írja be az e-mail hitelesítő kódot",
      registerCodePlaceholder: "Írja be a 6 számjegyű kódot",
      sendRegisterCode: "Kód küldése",
      sendRegisterCodeSuccess:
        "A hitelesítő kód elküldve. Kérjük, ellenőrizze az e-mail postafiókját.",
      sendRegisterCodeFailed: "A hitelesítő kód küldése sikertelen",
      backToLoginWithAccount: "Már van fiókja? Jelentkezzen be",
      forgotPassword: "Elfelejtette a jelszót?",
      forgotPasswordPageTitle: "Jelszó visszaállítása",
      forgotPasswordPageSubtitle:
        "Visszaállítsa bejelentkezési jelszavát regisztrált e-mail címmel és hitelesítő kóddal.",
      forgotPasswordPrompt: "Elfelejtette a jelszót?",
      forgotPasswordAction: "Visszaállítás",
      forgotPasswordDesc:
        "Az e-mail cím hitelesítése kóddal után közvetlenül beállíthatja az új bejelentkezési jelszót.",
      forgotPasswordHint:
        "Írja be regisztrált e-mail címét, a hitelesítő kódot és az új jelszót. Beküldés után azonnal bejelentkezhet az új jelszóval.",
      goToOtpLogin: "E-mail kóddal történő bejelentkezés",
      resetCode: "Visszaállítási kód",
      sendResetCode: "Visszaállítási kód küldése",
      sendResetCodeSuccess:
        "A visszaállítási kód elküldve. Kérjük, ellenőrizze az e-mail postafiókját.",
      sendResetCodeFailed: "A visszaállítási kód küldése sikertelen",
      resetPassword: "Jelszó visszaállítása",
      resetPasswordSuccess:
        "A jelszó sikeresen visszaállítva. Kérjük, jelentkezzen be az új jelszóval.",
      resetPasswordFailed: "A jelszó visszaállítása sikertelen",
      newPassword: "Új jelszó",
      confirmNewPassword: "Új jelszó megerősítése",
      newPasswordPlaceholder: "Írjon be legalább 8 karakter hosszú jelszót",
      confirmPassword: "Jelszó megerősítése",
      confirmPasswordPlaceholder: "Írja be újra a jelszót",
      backToLogin: "Vissza a bejelentkezéshez",
      emailRequired: "Írja be az e-mail címét",
      passwordRequired: "Írja be a jelszót",
      otpCodeRequired: "Írja be az e-mail hitelesítő kódot",
      phoneRequired: "Írja be a telefonszámot",
      phoneOtpCodeRequired: "Írja be az SMS hitelesítő kódot",
      emailInvalid: "Írjon be érvényes e-mail címet",
      resetCodeRequired: "Írja be a visszaállítási kódot",
      resetCodePlaceholder: "Írja be a 6 számjegyű visszaállítási kódot",
      newPasswordRequired: "Írjon be új jelszót",
      confirmNewPasswordRequired: "Megerősítse újra az új jelszót",
      newPasswordMinLength: "Az új jelszó legalább 8 karakter hosszú kell legyen",
      passwordMinLength: "A jelszó legalább 8 karakter hosszú kell legyen",
      newPasswordMismatch: "Az két új jelszó nem egyezik",
      passwordMismatch: "Az két jelszó nem egyezik",
      registrationClosed: "A regisztráció jelenleg zárva van",
      login: "Bejelentkezés",
      passkeyLogin: "Passkey",
      passkeyLoginDesc:
        "Használja a számítógépen vagy rendszerfiókjaiban ehhez a webhelyhez már kötött passkey-t.",
      passkeyLoginButton: "Passkey használata",
      passkeyLoginHint:
        "Először kötnie kell a passkey-t a fiókközpontban, mielőtt itt használná.",
      passkeyLoginSuccess: "A passkey sikeresen hozzáadva",
      passkeyNotAvailable:
        "Ezen az eszközön nincs ehhez a webhelyhez elérhető passkey. Használjon másik bejelentkezési módot.",
      passwordLogin: "Jelszó",
      otpLogin: "E-mail kód",
      phoneOtpLogin: "Telefonszám kód",
      email: "E-mail",
      phone: "Telefonszám",
      password: "Jelszó",
      otpCode: "E-mail kód",
      phoneOtpCode: "SMS kód",
      mfaCode: "2FA kód",
      mfaPlaceholder: "Hagysa üresen, ha a kétlépcsős hitelesítés nincs engedélyezve",
      sendOtpCode: "E-mail kód küldése",
      sendOtpCodeSuccess:
        "Az e-mail kód elküldve. Kérjük, ellenőrizze az e-mail postafiókját.",
      sendOtpCodeFailed: "A hitelesítő kód küldése sikertelen",
      sendOtpCodeEmailRequired: "Adja meg az e-mail címét, mielőtt kódot kérne",
      sendPhoneOtpCode: "SMS kód küldése",
      sendPhoneOtpCodeSuccess:
        "Az SMS kód elküldve. Kérjük, ellenőrizze a telefonját.",
      sendPhoneOtpCodeFailed: "Az SMS kód küldése sikertelen",
      sendPhoneBindingCode: "Kötési kód küldése",
      sendPhoneBindingCodeSuccess:
        "A telefonszám kötési kódja elküldve. Kérjük, ellenőrizze a telefonját.",
      sendPhoneBindingCodeFailed: "A telefonszám kötési kódjának küldése sikertelen",
      securityCaptcha: "Biztonsági ellenőrzés",
      securityCaptchaPlaceholder:
        "Írja be a biztonsági ellenőrzés értékét és próbálja újra",
      securityCaptchaHelp:
        "Ha a jelenlegi eszköz vagy IP túl gyakran küld kéréseket, fejezze be ezt a biztonsági ellenőrzést, mielőtt újabb kódot kérne.",
      securityCaptchaRequiredTip:
        "A kérések száma magas. Kérjük, fejezze be a biztonsági ellenőrzést, mielőtt újabb kódot kérne.",
      sendOtpCodePhoneRequired:
        "Adja meg a telefonszámát, mielőtt kódot kérne",
      phoneBindingPageTitle: "Telefonszám kötése",
      phoneBindingRegisterDesc:
        "Ez a fiók a regisztráció után rizikás szabálytalanságot rögzített. Kérjük, kösse ki egy telefonszámot a folytatás előtt.",
      phoneBindingLoginDesc:
        "Ez a fiók a bejelentkezés során rizikás szabálytalanságot rögzített. Kérjük, kösse ki egy telefonszámot a folytatás előtt.",
      completePhoneBinding: "Kötés és folytatás",
      phoneBindingSuccess:
        "A telefonszám sikeresen kötve. A fiók ismét aktív.",
      mfaVerifyTitle: "Kétlépcsős hitelesítés",
      mfaVerifyEmailHint:
        "Hitelesítő kód elküldve a {{target}} címre. Írja be, hogy folytassa a bejelentkezést.",
      mfaVerifyPhoneHint:
        "Hitelesítő kód elküldve a {{target}} címre. Írja be, hogy folytassa a bejelentkezést.",
      loginStepUpTitle: "További bejelentkezési ellenőrzés",
      loginStepUpEmailDesc:
        "Ez a bejelentkezés további e-mail ellenőrzést igényel. Kódot küldünk a {{email}} címre.",
      loginStepUpSMSDesc:
        "Ez a bejelentkezés további telefonszám ellenőrzést igényel. Kódot küldünk a {{phone}} számra.",
      loginStepUpDualDesc:
        "Ez a bejelentkezés e-mail és telefonszám ellenőrzést igényel. E-mail: {{email}}, telefonszám: {{phone}}.",
      loginStepUpExpired:
        "A további bejelentkezési ellenőrzési munkamenet lejárt. Kérjük, jelentkezzen be újra.",
      forcedMfaEnrollmentTitle: "Kétlépcsős hitelesítés engedélyezése szükséges",
      forcedMfaEnrollmentDesc:
        "Az adminisztrátor megköveteli, hogy ennek a fióknak kétlépcsős hitelesítését engedélyezze, mielőtt a bejelentkezés befejeződhet.",
      forcedMfaEnrollmentExpired:
        "A kényszerített MFA regisztrációs munkamenet lejárt. Kérjük, jelentkezzen be újra.",
      completeForcedMfaEnrollment: "Engedélyezés és folytatás",
      cancelForcedMfaEnrollment: "Mégsem és vissza a bejelentkezéshez",
      verifyAndLogin: "Ellenőrzés és bejelentkezés",
      deletionConfirmTitle: "Fiók törlési kérelem beérkezett",
      deletionConfirmScheduledAt: "Tervezett törlési idő: {{date}}",
      deletionConfirmDesc:
        "Újra bejelentkezés a törlést megvonja.",
      deletionConfirmContinue: "Folytatás és törlés visszavonása",
      deletionConfirmExpired: "A megerősítés lejárt, kérjük, jelentkezzen be újra",
      deletionConfirmFailed: "A megerősítés sikertelen, kérjük, jelentkezzen be újra",
      logoutProgressTitle: "Kijelentkezés",
      logoutProgressDesc:
        "Az identitás munkamenete törölve lett, és a kapcsolt alkalmazások kijelentkeznek.",
      loginFailed: "Sikertelen bejelentkezés",
      oidcCallbackFailed: "OIDC visszahívás sikertelen",
      appRejected: "Az alkalmazás elutasítva",
      appRejectedWithReason: "Az alkalmazás elutasítva: {{reason}}",
      appNotFound: "Az alkalmazás nem található",
      accessDenied: "Hozzáférés megtagadva",
      tokenExchangeFailed: "Token csere sikertelen",
      authorize: {
        title: "Használja a {{siteName}}-t a {{appName}} bejelentkezéséhez",
        desc: "Ez az alkalmazás a következő információkat és engedélyeket kéri. Megerősítés után vissza fog térni az üzleti alkalmazáshoz a bejelentkezés befejezéséhez.",
        chooseAccountTitle: "Már bejelentkezett a {{siteName}}-ra",
        chooseAccountDesc:
          "Válassza, hogy folytatja-e a jelenlegi fiókkal, vagy először másik fiókkal jelentkezik be.",
        currentAccountFallback: "Jelenlegi fiók",
        useCurrentAccount: "Folytatás ezzel a fiókkal",
        useAnotherAccount: "Másik fiókkal jelentkezés",
        permissionTitle: "Kért engedélyek",
        permissionCount: "{{count}} elem",
        agreement:
          "Olvastam és elfogadom, hogy az alkalmazás megkapja a fenti engedélyeket",
        confirm: "Megerősítés és folytatás",
        cancel: "Mégsem és vissza a bejelentkezéshez",
        scopes: {
          openidTitle: "Identitás megerősítése",
          openidDesc:
            "Az aktuálisan bejelentkezett fiók Ön tulajdonában való megerősítésére és az alapszintű bejelentkezési munkamenet létrehozására használatos.",
          profileTitle: "Nyilvános profil megtekintése",
          profileDesc:
            "Beleértve a megjelenített nevet, avatart és hasonló nyilvános profiladatokat az alkalmazásbeli megjelenítéshez.",
          emailTitle: "E-mail információk megtekintése",
          emailDesc:
            "A fiók e-mailjának megjelenítésére vagy szükség esetén értesítésekhez és fiókkötéshez használatos.",
          phoneTitle: "Telefonszám megtekintése",
          phoneDesc:
            "Fiók azonosítására, értesítésekre vagy szükség esetén biztonsági ellenőrzésre használatos.",
          gatewayReadTitle: "Védelemmel ellátott üzleti API-ok elérés",
          gatewayReadDesc:
            "Engedélyezi az alkalmazásnak, hogy Ön nevében hozzáférjen a jogosultsággal védett erőforrásokhoz.",
          customTitle: "Engedély kérése: {{scope}}",
          customDesc:
            "Ez az alkalmazás további üzleti engedélyt kér. Óvatosan tekintse át, mielőtt folytatná.",
        },
      },
      sessionConflict: {
        title: "A böngészőben különböző fiókok észleltek",
        desc: "Ennek az ablaknak a fióka nem egyezik a böngésző aktuálisan aktív fiókjával. Egy böngészőben egyszerre csak egy fő fiók maradhat aktív. Válassza ki, melyik fiókkal folytatja.",
        browserAccount: "Böngésző aktív fiókja",
        thisWindowAccount: "Ennek az ablaknak a korábbi fióka",
        useBrowserAccount: "A böngésző aktív fiókjának használata",
        useThisWindowAccount: "Visszalépés ennek az ablaknak a fiókjához",
        relogin: "Kijelentkezés és újraküldés",
      },
    },
    nav: {
      security: "Bejelentkezés és biztonság",
      profile: "Profil",
      privacy: "Adatvédelmi központ",
      bindings: "Engedélyezett alkalmazások",
      help: "Segítségközpont",
    },
    common: {
      loadingFailed: "Betöltés sikertelen",
      revokeFailed: "Az engedély visszavonása sikertelen",
      revokeSuccess: "Az engedély visszavonva",
      confirm: "Megerősítés",
      sendCode: "Kód küldése",
      sendCodeSuccess: "A hitelesítő kód sikeresen elküldve",
      sendingCode: "Küldés",
      save: "Mentés",
      saving: "Mentés",
      edit: "Szerkesztés",
      cancel: "Mégsem",
      uploadAvatar: "Avatar feltöltése",
      avatarUpdated: "Az avatar frissítve",
      avatarUploadFailed: "Az avatar feltöltése sikertelen",
      profileUpdated: "A profil frissítve",
      profileUpdateFailed: "A profil frissítése sikertelen",
      imageReadFailed: "Kép olvasása sikertelen",
      imageProcessUnsupported:
        "A képfeldolgozás nem támogatott ebben a böngészőben",
      avatarConvertFailed: "Az avatar konvertálása sikertelen",
      unset: "Nincs beállítva",
      unsetShort: "Nincs beállítva",
      notFilled: "Nincs kitöltve",
      noRecord: "Nincs rekord",
      normal: "Aktív",
      accountCenter: "Fiókközpont",
      noAuthorizedApps: "Nincsenek engedélyezett alkalmazások",
    },
    errors: {
      emailRequiredByServer: "Kérjük, adja meg az e-mail címét",
      passwordRequiredByServer: "Kérjük, adja meg a jelszót",
      invalidCredentials: "Érvénytelen fiók vagy hitelesítő adatok",
      invalidOtpCode: "A hitelesítő kód érvénytelen vagy lejárt",
      accountFrozen: "Ez a fiók fagyasztva",
      accountFrozenWithReason:
        "Ez a fiók fagyasztva. Ok: {{reason}}",
      userNotFound: "Felhasználó nem található",
      smsNotConfigured: "Az SMS küldés nincs konfigurálva",
      smtpNotConfigured: "Az e-mail küldés nincs konfigurálva",
      userStatusInvalid:
        "A fiók jelenlegi állapota nem engedélyezi ezt az műveletet",
      invalidCurrentPhoneVerificationCode:
        "A jelenlegi telefonszám hitelesítő kódja érvénytelen vagy lejárt",
      invalidNewPhoneVerificationCode:
        "Az új telefonszám hitelesítő kódja érvénytelen vagy lejárt",
      currentPhoneVerificationCodeRequired:
        "Adja meg a jelenlegi telefonszám hitelesítő kódját",
      currentPhoneNotBound:
        "Jelenleg nincs telefonszám kötve ehhez a fiókhoz",
      phoneDoesNotMatchCurrentBoundPhone:
        "A telefonszám nem egyezik a jelenleg kötött számmal",
      phoneAlreadyBound: "Ez a telefonszám már kötve van",
      newPhoneMustBeDifferent:
        "Az új telefonszámnak különböznie kell a jelenlegtől",
      phoneAndVerificationCodeRequired:
        "Adja meg a telefonszámot és az új telefonszám hitelesítő kódját",
      invalidMfaCode: "A kétlépcsős hitelesítő kód érvénytelen vagy lejárt",
      unsupportedMfaMethod: "Nem támogatott kétlépcsős hitelesítési módszer",
      mfaNotEnabled:
        "A kétlépcsős hitelesítés nem engedélyezve ehhez a fiókhoz",
      emailNotBound: "Nincs e-mail kötve ehhez a fiókhoz",
      phoneNotBound: "Nincs telefonszám kötve ehhez a fiókhoz",
      emailVerificationCodeRequired: "Adja meg az e-mail hitelesítő kódját",
      invalidEmailVerificationCode:
        "Az e-mail hitelesítő kód érvénytelen vagy lejárt",
      phoneVerificationCodeRequired: "Adja meg a telefonszám hitelesítő kódját",
      invalidPhoneVerificationCode:
        "A telefonszám hitelesítő kód érvénytelen vagy lejárt",
      newPasswordMustBeDifferentFromCurrentPassword:
        "Az új jelszónak különböznie kell a jelenlegtől",
      phoneBindingChallengeExpired:
        "A telefonszám kötési munkamenet lejárt. Kérjük, jelentkezzen be újra vagy regisztráljon.",
      manualMfaCodeNotSendable:
        "Ez a fiók manuális MFA kódot használ, és nem küldhet kódot",
      emailAndPasswordRequired:
        "Adja meg az e-mail címét és jelszavát, mielőtt kétlépcsős kódot kérne",
      mfaChallengeExpiredOrInvalid:
        "A kétlépcsős hitelesítési munkamenet lejárt. Kérjük, jelentkezzen be újra.",
      challengeRequired:
        "Fejezze be a biztonsági kihívást, mielőtt kódot kérne.",
      captchaRequired:
        "A kérések száma magas. Kérjük, először fejezze be a biztonsági ellenőrzést.",
      rateLimitExceeded: "Túl sok kérés. Kérjük, próbálja később.",
      circuitOpen:
        "A szállítási csatorna átmenetileg védett. Kérjük, próbálja később.",
      cooldownActive:
        "Ez a cél túl gyakran kért kódokat. Kérjük, próbálja később.",
      passkeyChallengeExpired: "A passkey munkamenet lejárt. Kérjük, próbálja újra.",
      passkeyVerificationFailed:
        "A passkey ellenőrzése sikertelen. Próbálja újra vagy használjon másik bejelentkezési módot.",
      passkeyAlreadyExists: "Ez a passkey már kötve van.",
      passkeyNotFound: "Passkey nem található.",
      passkeyBrowserUnsupported:
        "Ez a böngésző vagy eszköz nem támogatja a passkey-eket.",
      passkeyUserHandleInvalid:
        "A passkey-hez tartozó fiók nem azonosítható.",
      invalidLoginStepUpVerificationCode:
        "A további hitelesítő kód érvénytelen vagy lejárt.",
      loginStepUpChallengeExpiredOrInvalid:
        "A további hitelesítési munkamenet lejárt. Kérjük, jelentkezzen be újra.",
      mfaEnrollmentChallengeExpiredOrInvalid:
        "A kényszerített MFA regisztrációs munkamenet lejárt. Kérjük, jelentkezzen be újra.",
      noAvailableMfaMethodForCurrentAccount:
        "Ehhez a fiókhoz nincs elérhető MFA módszere.",
      noAvailableLoginVerificationTargetForCurrentAccount:
        "Ehhez a fiókhoz nincs elérhető további hitelesítési célpont.",
    },
    security: {
      loginMethods: "Bejelentkezési módszerek",
      phone: "Telefonszám kötése",
      phoneDesc:
        "További bejelentkezési módszerekhez, SMS ellenőrzéshez és fiók biztonsági értesítéseihez használatos",
      bindPhone: "Kötés",
      bindPhoneTitle: "Telefonszám kötése",
      bindPhoneHint:
        "Kéreljük, először ellenőrizze a telefonszámot, mielőtt kötné. A hitelesítő kódot erre a telefonszámra küldjük.",
      rebindPhoneHint:
        "Az aktuálisan kötött telefonszám cseréjehez először ellenőrizze a jelenleg kötött telefonszámot, majd az újat.",
      currentPhone: "Jelenleg kötött telefonszám",
      currentPhoneCode: "Jelenlegi telefonszám hitelesítő kódja",
      currentPhoneCodePlaceholder:
        "Írja be a jelenlegi telefonszámra küldött 6 számjegyű kódot",
      sendCurrentPhoneCode: "Jelenlegi telefonszám kódjának küldése",
      newPhone: "Telefonszám",
      newPhoneCode: "Új telefonszám hitelesítő kódja",
      newPhonePlaceholder: "Írja be a telefonszámot, például 13800138000",
      smsCode: "SMS hitelesítő kód",
      smsCodePlaceholder: "Írja be a 6 számjegyű SMS kódot",
      safeEmail: "Biztonságos e-mail",
      safeEmailDesc: "Fő hitelesítő, amellyel bejelentkezhet",
      editEmailTitle: "Biztonságos e-mail módosítása",
      newEmail: "Új e-mail",
      newEmailPlaceholder: "Írja be az új e-mail címet",
      emailCode: "E-mail kód",
      emailCodePlaceholder: "Írja be a 6 számjegyű kódot",
      changeEmailHint:
        "Az új e-mailt ellenőrizni kell, mielőtt a változtatást mentjük.",
      changePassword: "Jelszó módosítása",
      changePasswordDesc:
        "Rendszeresen frissítse bejelentkezési jelszavát a fiók biztonságának növelése érdekében",
      editPasswordTitle: "Bejelentkezési jelszó módosítása",
      currentPassword: "Jelenlegi jelszó",
      currentPasswordPlaceholder: "Írja be a jelenlegi jelszót",
      currentPasswordIncorrect: "A jelenlegi jelszó helytelen",
      newPassword: "Új jelszó",
      newPasswordPlaceholder: "Írjon be legalább 8 karakter hosszú új jelszót",
      confirmPassword: "Új jelszó megerősítése",
      confirmPasswordPlaceholder: "Írja be újra az új jelszót",
      changePasswordHint:
        "A következő bejelentkezéskor használja az új jelszót, és kerülje a régi jelszó ismételt használatát.",
      passwordMinLength: "A jelszó legalább 8 karakter hosszú kell legyen",
      passwordMismatch: "Az két új jelszó nem egyezik",
      passwordUpdated: "A jelszó frissítve",
      passwordUpdateFailed: "A jelszó frissítése sikertelen",
      mfa: "Kétlépcsős hitelesítés",
      mfaDesc: "Engedélyezve esetén a bejelentkezés során további ellenőrzés szükséges",
      mfaTitle: "Kétlépcsős hitelesítés konfigurálása",
      mfaHint: "Válassza ki a bejelentkezés során használt második hitelesítési módszert.",
      mfaTitleEnable: "Kétlépcsős hitelesítés engedélyezése",
      mfaTitleDisable: "Kétlépcsős hitelesítés letiltása",
      mfaHintEnable:
        "Válassza ki a bejelentkezés során használt második hitelesítési módszert.",
      mfaHintDisable:
        "Letiltás után a bejelentkezés során nem lesz szükség további ellenőrzésre.",
      mfaMethod: "Hitelesítési módszert",
      mfaMethodEmail: "E-mail kód",
      mfaMethodSMS: "Telefonszám kód",
      passkeys: "Passkey-ek",
      passkeysDesc:
        "Kötés után közvetlenül bejelentkezhet a rendszer passkey kiválasztójából.",
      addPasskey: "Passkey hozzáadása",
      deletePasskey: "Passkey törlése",
      passkeyName: "Eszköz neve",
      passkeyNamePlaceholder: "Adjon meg egy könnyen azonosítható nevet",
      passkeyLastUsed: "Utoljára használt",
      passkeyLastUsedIP: "Utoljára használt IP",
      passkeyCreatedAt: "Létrehozva",
      passkeyEmpty: "Nincsenek kötött passkey-ek",
      passkeyManageVerify:
        "Fiókja védelme érdekében ellenőrizze jelenlegi hitelesítő adatait, mielőtt hozzáadna vagy törölne egy passkey-t.",
      currentMfaCode: "Jelenlegi MFA kód",
      currentMfaCodePlaceholder: "Írja be a jelenlegi MFA módszerről származó kódot",
      currentMfaCodeHintEmail:
        "Mentés előtt kérjük, végezzen el egy további ellenőrzést a jelenleg kötött e-mail kóddal.",
      currentMfaCodeHintSMS:
        "Mentés előtt kérjük, végezzen el egy további ellenőrzést a jelenleg kötött telefonszám kóddal.",
      currentMfaCodeHintManual:
        "Mentés előtt írja be a jelenleg konfigurált manuális MFA kódot.",
      accountSecurity: "Fiók biztonsága",
      recentLogin: "Legutóbbi bejelentkezés",
      recentLoginDesc: "Utolsó sikeres bejelentkezés időpontja és eszköz IP-je",
    },
    profile: {
      title: "Profil",
      avatar: "Avatar",
      avatarDesc:
        "A kép automatikusan középre kerül, vágódik és webp formátumra konvertálódik",
      nickname: "Becenév",
      nicknameDesc: "Jelenleg megjelenített név",
      gender: "Nem",
      genderDesc: "A fiókhoz tartozó személyes nemi információ",
      languagePreference: "Nyelvpreferencia",
      languagePreferenceDesc:
        "Bejelentkezés után ez a nyelv fog elsőként használatos a oldal tartalmához",
      languagePreferenceSaved: "A nyelvpreferencia mentve",
      languagePreferenceSaveFailed: "A nyelvpreferencia mentése sikertelen",
      genderMale: "Férfi",
      genderFemale: "Nő",
      genderOther: "Egyéb",
      userId: "Felhasználóazonosító",
      userIdDesc: "A rendszerben a jelenlegi fiók egyedi azonosítója",
      nicknamePlaceholder: "Írja be a becenevét",
      editNicknameTitle: "Becenév szerkesztése",
      editGenderTitle: "Nem szerkesztése",
      email: "E-mail cím",
      emailDesc: "Bejelentkezéshez, ellenőrzéshez és biztonsági értesítésekhez használatos",
      createdAt: "Regisztrálva",
      createdAtDesc: "A fiók első létrehozásának időpontja",
      country: "Regisztrációs ország",
      countryDesc: "A fiók regisztrálásakor rögzített ország vagy régió",
    },
    privacy: {
      title: "Adatvédelmi központ",
      exportTitle: "Felhasználói adatok letöltése",
      exportDesc:
        "Profiladatok és visszavonatlanul engedélyezett alkalmazások exportálása CSV formátumban.",
      exportAction: "Adatok letöltése",
      exportPasswordVerifyDesc:
        "Kérjük, ellenőrizze jelenlegi bejelentkezési jelszavát a letöltés előtt. A CSV tartalmazni fogja a profiladatokat és a visszavonatlanul engedélyezett alkalmazásokat.",
      exportSuccess: "A felhasználói adatok letöltése elkezdődött",
      exportFailed: "A felhasználói adatok exportálása sikertelen",
      minimizeTitle: "Adatminimalizálás",
      minimizeDesc:
        "A rendszer csak a regisztrációs országot, e-mailt, engedélyeket és szükséges bejelentkezési biztonsági adatokat tartja meg.",
      scopeTitle: "Jelenlegi hozzáférési hatókör",
      scopeDesc:
        "Megtekintheti, mely alkalmazások fértek hozzá a fiókjához az Engedélyezett alkalmazásokban, és bármikor visszavonta az engedélyeket.",
      statusTitle: "Fiókállapot",
      statusDesc:
        "Ha a fiók fagyasztva van, a bejelentkezés blokkolva lesz, amíg az adminisztrátor meg nem oldja.",
      deleteTitle: "Fiók törlése",
      deleteDesc:
        "Ha 7 napon belül újra bejelentkezik, a törlési kérelem automatikusan visszavonásra kerül. Ellenkező esetben a fiók és az engedélyadatok törlődnek.",
      deleteWarningPrimary:
        "A fiók törlése visszafordíthatatlan. Kérjük, először készítsen biztonsági másolatot minden a fiókjával kapcsolatos adatról.",
      deleteWarningSecondary:
        "A kérelem beküldése után 7 napon belül történő újra bejelentkezés a törlést visszavonja. Ha 7 napon belül nem jelentkezik be, a rendszer automatikusan törli a fiókot és az engedélyadatokat.",
      deleteAction: "Olvastam és vállalom a következményeket",
      passwordVerifyTitle: "Jelenlegi jelszó ellenőrzése",
      passwordVerifyDesc:
        "Írja be jelenlegi bejelentkezési jelszavát, és végezzen el e-mail ellenőrzést. Ha telefonszám kötve van, telefonszám ellenőrzés is szükséges.",
      emailVerifyCode: "E-mail hitelesítő kód",
      emailVerifyCodePlaceholder: "Írja be az e-mailjába küldött 6 számjegyű kódot",
      sendDeleteEmailCode: "E-mail kód küldése",
      sendDeleteEmailCodeSuccess:
        "Az e-mail hitelesítő kód elküldve. Kérjük, ellenőrizze az e-mail postafiókját.",
      sendDeleteEmailCodeFailed: "Az e-mail hitelesítő kód küldése sikertelen",
      phoneVerifyCode: "Telefonszám hitelesítő kód",
      phoneVerifyCodePlaceholder: "Írja be a telefonjába küldött 6 számjegyű kódot",
      sendDeletePhoneCode: "Telefonszám kód küldése",
      sendDeletePhoneCodeSuccess:
        "A telefonszám hitelesítő kód elküldve. Kérjük, ellenőrizze a telefonját.",
      sendDeletePhoneCodeFailed: "A telefonszám hitelesítő kód küldése sikertelen",
      confirmDeleteNow: "Törlési kérelem beküldése",
      deleteSuccess:
        "Törlési kérelem beküldve. 7 napon belül történő bejelentkezés visszavonja.",
      deleteFailed: "Törlési kérelem beküldése sikertelen",
      deletePendingAt:
        "Törlési kérelem beküldve. Tervezett törlési idő: {{date}}",
    },
    bindings: {
      title: "Engedélyezett alkalmazások",
      appId: "Alkalmazás neve",
      scopes: "Hatókörök",
      createdAt: "Engedélyezve",
      authorizedAt: "Engedélyezve",
      status: "Állapot",
      action: "Művelet",
      viewDetails: "Részletek",
      detailTitle: "Engedélyezési részletek",
      siteName: "Engedélyezett webhely",
      requestedPermissions: "Adott engedélyek",
      accessStatus: "Hozzáférési állapot",
      reason: "Ok",
      effectiveAt: "Érvényesség kezdete",
      expiresAt: "Lejárat dátuma",
      accessStatusNormal: "Aktív",
      accessStatusRestricted: "Korlátozott",
      accessStatusBanned: "Tiltott",
      scopeOpenIdTitle: "Identitás megerősítése",
      scopeOpenIdDesc:
        "Az aktuálisan bejelentkezett fiók valóban Öné való megerősítésére és az alapszintű bejelentkezési munkamenet létrehozására használatos.",
      scopeProfileTitle: "Nyilvános profil megtekintése",
      scopeProfileDesc:
        "Beleértve a becenevet, avatart és egyéb nyilvános profiladatokat az alkalmazásbeli megjelenítéshez.",
      scopeEmailTitle: "E-mail cím megtekintése",
      scopeEmailDesc:
        "A fiók e-mailjának megjelenítésére vagy szükség esetén értesítésekhez és fiókkötéshez használatos.",
      scopePhoneTitle: "Telefonszám megtekintése",
      scopePhoneDesc:
        "Fiók azonosítására, értesítésekre vagy szükség esetén biztonsági ellenőrzésre használatos.",
      scopeGatewayReadTitle: "Védelemmel ellátott üzleti API-ok elérés",
      scopeGatewayReadDesc:
        "Engedélyezi az alkalmazásnak, hogy Ön nevében hozzáférjen a jogosultsággal védett API-erőforrásokhoz az engedélyezés után.",
      scopeCustomTitle: "Engedély kérése: {{scope}}",
      scopeCustomDesc:
        "Ez az alkalmazás további üzleti engedélyt kér. Óvatosan tekintse át, mielőtt folytatná.",
      revoke: "Visszavonás",
      batchRevoke: "Tömeges visszavonás",
      batchRevokeConfirmTitle: "Tömeges visszavonás megerősítése?",
      batchRevokeConfirmDesc:
        "{{count}} engedélyezés kiválasztva. Ezeknek az alkalmazásoknak újból kérniük kell az engedélyt.",
    },
    help: {
      title: "Segítségközpont",
      loginIssueTitle: "Nem tud bejelentkezni",
      loginIssueDesc:
        "Ha nem tud bejelentkezni, először győződjön meg arról, hogy a fiókhoz megfelelő módszert használja, például jelszót, e-mail kódot, telefonszám kódot vagy passkey-t. Ha a hitelesítő kód elutasításra kerül, győződjön meg arról, hogy a legújabb, és még érvényes. Ha a fiók fagyasztott, aktiválásra váró vagy más módon korlátozott, a problémát a platform adminisztrátora kell megoldania. Ha nemrégiben fiók törlési kérést küldött, a rendszer szintén kérhet törlés megerősítést vagy telefonszám kötést, mielőtt a hozzáférés helyreáll.",
      protectTitle: "Fiókja védelme",
      protectDesc:
        "Engedélyezze a kétlépcsős hitelesítést a lehető leggyorsabban, és kösse be passkey-eket megbízható eszközökön, hogy csökkentse az egyetlen jelszó ártalmatlanításának kockázatát. Soha ne ossza meg e-mail kódokat, SMS kódokat vagy MFA kódokat harmadik felekkel, és ne írja be újra a hitelesítő adatokat olyan oldalakról, amelyekre nem bízik. Ha ugyanazt a fiókot több eszközön használja, rendszeresen ellenőrizze az utolsó bejelentkezéseket, a kötött passkey-eket és az engedélyezett alkalmazások listáját, és távolítsa el a már nem használt eszközöket vagy engedélyeket.",
      authIssueTitle: "Engedélyezési problémák",
      authIssueDesc:
        "Ha egy alkalmazás ismeretlennek tűnik, nem szokványos hatóköröket kér, vagy gyanakodzi, hogy fiókját visszaélve használják, nyissa meg az Engedélyezett alkalmazások lapot, hogy megtekintse az engedélyezés időpontját, a megadott hatóköröket és a integrációs adatokat, majd ha szükséges, azonnal visszavonta az engedélyt. Visszavonás után az alkalmazás nem fogja tudni továbbra is hozzáférni a védett erőforrásokhoz a fiókjával, amíg újra be nem jelentkezik, és nem erősíti meg a új engedélykérést. Ha a probléma nem csak egy alkalmazásra, hanem a teljes fiókra vonatkozik, akkor a jelszót is meg kell változtatnia, ellenőriznie kell a MFA beállításait, és meg kell néznie az utolsó bejelentkezési és passkey-aktivitásokat.",
      contactTitle: "Kapcsolat",
      contactDesc:
        "Ha manuális támogatásra van szüksége, kapcsolódjon a platform támogatási személyével az alább megadott módon. Problema jelentésekor adja meg a fiók e-mail címét, a probléma megjelenésének időpontját, a hibaüzenetek képernyőfotóit, a használt bejelentkezési módot és az eszköz vagy böngésző kapcsolatos információkat, hogy a probléma gyorsabban megoldható legyen.",
      contactMainlandTitle: "Közép-Kína",
      contactOverseasTitle: "Távoli régiók",
      contactPersonLabel: "Kapcsolattartó:",
      contactPhoneLabel: "Telefon:",
      contactEmailLabel: "E-mail:",
      contactHoursLabel: "Támogatási idő:",
      contactMainlandPersonValue: "YOUR_NAME",
      contactMainlandPhoneValue: "YOUR_PHONE_NUMBER",
      contactMainlandEmailValue: "YOUR_EMAIL",
      contactMainlandHoursValue: "Hétfő–péntek 09:00–18:00",
      contactOverseasPersonValue: "Későbbi kitöltés",
      contactOverseasPhoneValue: "Későbbi kitöltés",
      contactOverseasEmailValue: "Későbbi kitöltés",
      contactOverseasHoursValue: "Hétfő–péntek 09:00–18:00",
      contactRegionNotice:
        "Kérjük, először forduljon a saját régiójának támogatási csatornájához. Ha nem biztos abban, hogy melyik régió vonatkozik rá, kezdje a Közép-Kína kapcsolattartójával, aki továbbítja.",
      contactNotice:
        "Fagyasztott fiókok, abnormalis engedélyezések, elveszett passkey-ek vagy törlés helyreállításához kapcsolódjon először az adminisztrátorhoz a fenti telefonszámon vagy e-mailen. Ha a platform hivatalos jegyrendszert, közleménytáblát vagy műveleti csoportot biztosít, először kövesse azt a hivatalos csatornát.",
    },
  },
} as const;

export default locale;