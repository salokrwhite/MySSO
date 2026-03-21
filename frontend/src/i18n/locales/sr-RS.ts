const locale = {
  translation: {
    header: {
      language: "Promeni jezik",
      languageModalTitle: "Izaberite jezik",
      languageModalDesc: "Odaberite jezik korisničkog interfejsa koji želite da koristite.",
      agreement: "Ugovor o korišćenju",
      privacy: "Politika privatnosti",
      help: "Centar za pomoć",
      logout: "Odjavite se",
      accountCenter: "Centar naloga",
    },
    legal: {
      back: "Povratak na početnu stranu",
      updatedAt: "Poslednja izmena: {{date}}",
      agreement: {
        title: "Ugovor o korišćenju",
        updatedAt: "2026-03-16",
        intro:
          "Dobrodošli na {{siteName}}. Pre registracije, prijave, povezivanja ili korišćenja usluga jedinstvene autentifikacije koje ovaj sistem nudi, trebate pažljivo pročitati ovaj ugovor. Nastavkom korišćenja usluga, saglasni ste da se pridržavate ovog ugovora.",
        sections: {
          accountTitle: "1. Nalog i prijava",
          accountP1:
            "Morate pružiti tačne, zakonite i dostupne informacije za registraciju i čuvati vaš nalog, lozinku, verifikacione kodove i druge poverenje za prijavu na siguran način. Vi ste odgovorni za gubitke nastale zbog loše čuvanja poverenja.",
          accountP2:
            "Platforma ima pravo, kada detektuje nenormalnu aktivnost prijavljivanja, kršenje pravila, frizirani status ili sigurnosne rizike, da zahteva dodatnu verifikaciju, ograniči prijavu ili suspenduje pristup radi bezbednosti.",
          acceptableUseTitle: "2. Prihvatljivo korišćenje",
          acceptableUseP1:
            "Ne smete koristiti ovaj sistem za nikakvu protivzakonsku aktivnost, kršenje prava drugih, zlouporabu interfejsa autentifikacije, masovne zahteve, probiranje lozinki ili bilo koju drugu aktivnost koja ugrožava stabilnost platforme ili omalovažava sigurnosne kontrole.",
          acceptableUseP2:
            "Ako kršite ovaj ugovor ili povezana pravila, platforma može suspendovati ili prekinuti deo ili ceo vaš pristup i zadržava pravo da traži odgovornost kada je potrebno.",
          authorizationTitle: "3. Autorizacija i aplikacije trećih strana",
          authorizationP1:
            "Kada koristite nalog {{siteName}} za prijavu u aplikaciju treće strane, sistem će tražiti vaše saglasnost na osnovu dozvola prikazanih na stranici autorizacije. Možete odbiti ili povući to saglasnost u bilo kom trenutku u centru naloga.",
          authorizationP2:
            "Bilo koje korišćenje vaših podataka od strane aplikacije treće strane nakon autorizacije uređuje se odgovornim uslovima korišćenja i politikom privatnosti te aplikacije. Platforma će preuzeti odgovornost samo u opsegu zahtevanom zakonom.",
          developerTitle: "4. Integracija developera",
          developerP1:
            "Developeri moraju osigurati da su informacije o aplikaciji, URI-ji za preusmeravanje, tražene dozvole i poslovni ciljevi tačni, kompletni i kontinuirano važi, i ne smeju varati korisnike.",
          developerP2:
            "Platforma može pregledavati, odbacivati, uklanjati, brisati ili ograničavati povezane aplikacije kako bi održala sigurnost i integritet ekosistema jedinstvene identifikacije.",
          liabilityTitle: "5. Promene usluga i ograničenje odgovornosti",
          liabilityP1:
            "Iz razloga sigurnosti, uključenosti u zakonodavstvo, operacija ili održavanja, platforma može prilagoditi, nadograditi, suspendovati ili prekinuti određene interfejse, tokove ili funkcije, i pokušat će dati obaveštenje kada je primereno.",
          liabilityP2:
            "U opsegu dozvoljenom zakonom, platforma nije odgovorna preko zakonskih obaveza za prekidane usluge, nenormalne podatke ili gubitke uzrokovane silnim prilikama, mrežnim greškama, razlozima trećih strana ili nepravilnim korišćenjem sa vaše strane.",
        },
      },
      privacy: {
        title: "Politika privatnosti",
        updatedAt: "2026-03-16",
        intro:
          "{{siteName}} ceni vaše lične informacije i sigurnost naloga. Ova politika objašnjava kako sakupljamo, koristimo, čuvamo, delimo i zaštitavamo vaše informacije, kao i prava koja vam su dostupna.",
        sections: {
          dataCollectionTitle: "1. Informacije koje sakupljamo",
          dataCollectionP1:
            "Kada se registrujete, prijavljujete ili koristite usluge naloga, možemo sakupiti vašu zemlju registracije, e-adresu, broj telefona, hash lozinke, sesije prijave, IP uređaja, zapise autorizacije i potrebne sigurnosne zapise.",
          dataCollectionP2:
            "Kada postavite avatar, promenite profil, povežete broj telefona, uključite MFA ili autorizujete aplikaciju treće strane, obrađujemo informacije koje ste podigli po potrebi za pružanje te funkcije.",
          dataUsageTitle: "2. Kako koristimo informacije",
          dataUsageP1:
            "Koristimo relevantne informacije za pružanje registracije naloga, autentifikaciju prijave, slanje verifikacionih kodova, kontrolu rizika, potvrdu autorizacije, pregled aplikacija developera, obaveštenja o sigurnosti naloga i održavanje pouzdanosti usluga.",
          dataUsageP2:
            "Takođe analiziramo zapise i statistike na osnovu minimalne potrebe da bismo detektovali nenormalnu aktivnost, unapredili korisničko iskustvo i ojačali sigurnost.",
          dataSharingTitle: "3. Deljenje i otkrivanje",
          dataSharingP1:
            "Samo kada eksplicitno autorizujete dozvole prikazane na stranici autorizacije, pružamo informacije o identitetu ili podatke povezane sa dozvolama aplikacijama trećih strana.",
          dataSharingP2:
            "Osim ako zakon to zahteva, regulatorni zahtevi, zaštita javnog interesa ili potrebe sistema sigurnosti, ne prodajemo ili ne delimo vaše lične informacije sa nepovezanim trećim stranama na nezakonit način.",
          userRightsTitle: "4. Vaša prava",
          userRightsP1:
            "Možete pregledati i ažurirati vaš profil, vezivanja, zapise autorizacije i postavke sigurnosti u centru naloga, i možete povući saglasnost aplikacija ili podneti zahtev za brisanje naloga.",
          userRightsP2:
            "Ako vjerujete da su vaše informacije netačne, obrađene na netačan način ili korišćene preko potrebe, možete kontaktirati operatera platforme ili ostvariti svoja prava prema primenljivom zakonu.",
          securityTitle: "5. Zaštita i zadržavanje",
          securityP1:
            "Koristimo kontrolu pristupa, heširanje lozinki, isteku verifikacionih kodova, zapise revizije i mere minimizacije podataka kako bismo zaštitili vaše lične informacije i podatke o autentifikaciji.",
          securityP2:
            "U skladu sa zakonskim i poslovnim zahtevima, zadržavamo vaše informacije samo dok je to neophodno za ispunjavanje ciljeva usluga; nakon brisanja naloga ili isteka perioda zadržavanja, brićemo ili anonimizovaćemo podatke prema politikama.",
        },
      },
    },
    auth: {
      noAccount: "Nemate nalog?",
      registerNow: "Registrujte se odmah",
      registerPageTitle: "Kreiraj nalog",
      registerPageSubtitle:
        "Završite registraciju sa vašom zemljom, e-adresom i verifikacionim kodom e-pošte.",
      registerDisabled: "Registracija je trenutno onemogućena",
      registerSuccess:
        "Registracija je uspešna. Molimo prijavite se sa svojom lozinkom.",
      phoneBindingRequiredAfterRegister:
        "Registracija je uspešna. Prvo morate povezati broj telefona da biste aktivirali nalog.",
      registerFailed: "Registracija nije uspela",
      country: "Zemlja",
      countryRequired: "Odaberite zemlju",
      registerCode: "Kod e-pošte",
      registerCodeRequired: "Unesite verifikacioni kod e-pošte",
      registerCodePlaceholder: "Unesite 6-cifreni kod",
      sendRegisterCode: "Pošalji kod",
      sendRegisterCodeSuccess:
        "Verifikacioni kod je poslat. Proverite svoj e-poštovni sandućević.",
      sendRegisterCodeFailed: "Neuspešno slanje verifikacionog koda",
      backToLoginWithAccount: "Već imate nalog? Prijavite se",
      forgotPassword: "Zaboravili ste lozinku?",
      forgotPasswordPageTitle: "Resetujte lozinku",
      forgotPasswordPageSubtitle:
        "Resetujte lozinku za prijavu sa vašom registrovanom e-adresom i verifikacionim kodom.",
      forgotPasswordPrompt: "Zaboravili ste lozinku?",
      forgotPasswordAction: "Povratak lozinke",
      forgotPasswordDesc:
        "Nakon verifikacije vaše e-pošte kodom, možete direktno postaviti novu lozinku za prijavu.",
      forgotPasswordHint:
        "Unesite svoju registrovanu e-adresu, verifikacioni kod i novu lozinku. Nakon slanja možete se odmah prijaviti sa novom lozinkom.",
      goToOtpLogin: "Koristite prijavu sa kodom e-pošte",
      resetCode: "Kod za povratak",
      sendResetCode: "Pošalji kod za povratak",
      sendResetCodeSuccess:
        "Kod za povratak je poslat. Proverite svoj e-poštovni sandućević.",
      sendResetCodeFailed: "Neuspešno slanje koda za povratak",
      resetPassword: "Resetuj lozinku",
      resetPasswordSuccess:
        "Lozinka je uspešno resetovana. Molimo prijavite se sa novom lozinkom.",
      resetPasswordFailed: "Neuspešno resetovanje lozinke",
      newPassword: "Nova lozinka",
      confirmNewPassword: "Potvrdite novu lozinku",
      newPasswordPlaceholder: "Unesite lozinku sa najmanje 8 karaktera",
      confirmPassword: "Potvrdite lozinku",
      confirmPasswordPlaceholder: "Ponovo unesite lozinku",
      backToLogin: "Povratak na prijavu",
      emailRequired: "Unesite vašu e-adresu",
      passwordRequired: "Unesite vašu lozinku",
      otpCodeRequired: "Unesite verifikacioni kod e-pošte",
      phoneRequired: "Unesite vaš broj telefona",
      phoneOtpCodeRequired: "Unesite verifikacioni kod SMS-a",
      emailInvalid: "Unesite važeću e-adresu",
      resetCodeRequired: "Unesite kod za povratak",
      resetCodePlaceholder: "Unesite 6-cifreni kod za povratak",
      newPasswordRequired: "Unesite novu lozinku",
      confirmNewPasswordRequired: "Ponovo potvrdite novu lozinku",
      newPasswordMinLength: "Nova lozinka mora imati najmanje 8 karaktera",
      passwordMinLength: "Lozinka mora imati najmanje 8 karaktera",
      newPasswordMismatch: "Dve nove lozinke se ne podudaraju",
      passwordMismatch: "Dve lozinke se ne podudaraju",
      registrationClosed: "Registracija je trenutno zatvorena",
      login: "Prijavite se",
      passkeyLogin: "Passkey",
      passkeyLoginDesc:
        "Koristite passkey već povezan sa ovom stranicom na vašem uređaju ili sistemskom nalogu.",
      passkeyLoginButton: "Koristite Passkey",
      passkeyLoginHint:
        "Pre korišćenja ovde, morate povezati passkey u centru naloga.",
      passkeyLoginSuccess: "Passkey je uspešno dodan",
      passkeyNotAvailable:
        "Na ovom uređaju nema passkey-a za ovu stranicu. Koristite drugu metodu prijave.",
      passwordLogin: "Lozinka",
      otpLogin: "Kod e-pošte",
      phoneOtpLogin: "Kod telefona",
      email: "E-adresa",
      phone: "Broj telefona",
      password: "Lozinka",
      otpCode: "Kod e-pošte",
      phoneOtpCode: "Kod SMS-a",
      mfaCode: "2FA kod",
      mfaPlaceholder: "Ostavite prazno ako nije uključena dvostruka autentifikacija",
      sendOtpCode: "Pošalji kod e-pošte",
      sendOtpCodeSuccess:
        "Kod e-pošte je poslat. Proverite svoj e-poštovni sandućević.",
      sendOtpCodeFailed: "Neuspešno slanje verifikacionog koda",
      sendOtpCodeEmailRequired: "Unesite vašu e-adresu pre nego što zatražite kod",
      sendPhoneOtpCode: "Pošalji kod SMS-a",
      sendPhoneOtpCodeSuccess:
        "Kod SMS-a je poslat. Proverite svoj telefon.",
      sendPhoneOtpCodeFailed: "Neuspešno slanje koda SMS-a",
      sendPhoneBindingCode: "Pošalji kod za povezivanje",
      sendPhoneBindingCodeSuccess:
        "Kod za povezivanje telefona je poslat. Proverite svoj telefon.",
      sendPhoneBindingCodeFailed: "Neuspešno slanje koda za povezivanje telefona",
      securityCaptcha: "Sigurnosna provera",
      securityCaptchaPlaceholder:
        "Unesite vrednost sigurnosne provere i pokušajte ponovo",
      securityCaptchaHelp:
        "Kada trenutni uređaj ili IP šalju zahteve previše često, završite ovu sigurnosnu proveru pre nego što zatražite još jedan kod.",
      securityCaptchaRequiredTip:
        "Volumen zahteva je visok. Završite sigurnosnu proveru pre nego što zatražite još jedan kod.",
      sendOtpCodePhoneRequired:
        "Unesite vaš broj telefona pre nego što zatražite kod",
      phoneBindingPageTitle: "Povežite broj telefona",
      phoneBindingRegisterDesc:
        "Ovaj nalog je podložen pravilu rizika nakon registracije. Povežite broj telefona pre nego što nastavite.",
      phoneBindingLoginDesc:
        "Ovaj nalog je podložen pravilu rizika pri prijavi. Povežite broj telefona pre nego što nastavite.",
      completePhoneBinding: "Povežite i nastavite",
      phoneBindingSuccess:
        "Broj telefona je uspešno povezan. Nalog je opet aktivan.",
      mfaVerifyTitle: "Dvostruka verifikacija",
      mfaVerifyEmailHint:
        "Verifikacioni kod je poslat na {{target}}. Unesite ga da biste nastavili sa prijavom.",
      mfaVerifyPhoneHint:
        "Verifikacioni kod je poslat na {{target}}. Unesite ga da biste nastavili sa prijavom.",
      loginStepUpTitle: "Dodatna verifikacija prijave",
      loginStepUpEmailDesc:
        "Ova prijava zahteva dodatnu verifikaciju e-pošte. Kod će biti poslat na {{email}}.",
      loginStepUpSMSDesc:
        "Ova prijava zahteva dodatnu verifikaciju telefona. Kod će biti poslat na {{phone}}.",
      loginStepUpDualDesc:
        "Ova prijava zahteva i verifikaciju e-pošte i telefona. E-adresa: {{email}}, telefon: {{phone}}.",
      loginStepUpExpired:
        "Sesija dodatne verifikacije prijave je istekla. Molimo prijavite se ponovo.",
      forcedMfaEnrollmentTitle: "Morate omogućiti dvostruku autentifikaciju",
      forcedMfaEnrollmentDesc:
        "Administrator zahteva da ovaj nalog omogući dvostruku autentifikaciju pre nego što se prijava može završiti.",
      forcedMfaEnrollmentExpired:
        "Sesija prisilne registracije MFA je istekla. Molimo prijavite se ponovo.",
      completeForcedMfaEnrollment: "Omogućite i nastavite",
      cancelForcedMfaEnrollment: "Otkažite i vratite se na prijavu",
      verifyAndLogin: "Verifikujte i prijavite se",
      deletionConfirmTitle: "Podnet zahtev za brisanje naloga",
      deletionConfirmScheduledAt: "Planirano vreme brisanja: {{date}}",
      deletionConfirmDesc:
        "Ponovna prijava će otkazati brisanje.",
      deletionConfirmContinue: "Nastavite i otkažite brisanje",
      deletionConfirmExpired: "Potvrda je istekla, molimo prijavite se ponovo",
      deletionConfirmFailed: "Potvrda nije uspela, molimo prijavite se ponovo",
      logoutProgressTitle: "Odjavljivanje",
      logoutProgressDesc:
        "Sesija identifikacije je očistena i povezane aplikacije se odjavljuju.",
      loginFailed: "Prijava nije uspela",
      oidcCallbackFailed: "OIDC povratni poziv nije uspeo",
      appRejected: "Aplikacija je odbijena",
      appRejectedWithReason: "Aplikacija je odbijena: {{reason}}",
      appNotFound: "Aplikacija nije pronađena",
      accessDenied: "Pristup odbijen",
      tokenExchangeFailed: "Razmena tokena nije uspela",
      authorize: {
        title: "Koristite {{siteName}} za prijavu u {{appName}}",
        desc: "Ova aplikacija traži sledeće informacije i dozvole. Nakon potvrde, vraćaćete se u poslovnu aplikaciju da biste završili prijavu.",
        chooseAccountTitle: "Već ste prijavljeni na {{siteName}}",
        chooseAccountDesc:
          "Odaberite da li ćete nastaviti sa trenutnim nalogom ili se prvo prijaviti sa drugim nalogom.",
        currentAccountFallback: "Trenutni nalog",
        useCurrentAccount: "Nastavite sa ovim nalogom",
        useAnotherAccount: "Prijavite se sa drugim nalogom",
        permissionTitle: "Tražene dozvole",
        permissionCount: "{{count}} stavki",
        agreement:
          "Pročitao sam i saglasan sam da se date gore navedene dozvole",
        confirm: "Potvrdite i nastavite",
        cancel: "Otkažite i vratite se na prijavu",
        scopes: {
          openidTitle: "Potvrdite vaš identitet",
          openidDesc:
            "Koristi se za verifikaciju da li trenutni prijavljeni nalog pripada vama i za uspostavljanje osnovne sesije prijave.",
          profileTitle: "Pristup vašem javnom profilu",
          profileDesc:
            "Uključuje vaše prikazano ime, avatar i slične podatke o javnom profilu za prikaz unutar aplikacije.",
          emailTitle: "Pristup vašoj e-adresi",
          emailDesc:
            "Koristi se za prikaz vaše e-adrese naloga ili podršku obaveštenja i povezivanja naloga kada je potrebno.",
          phoneTitle: "Pristup vašem broju telefona",
          phoneDesc:
            "Koristi se za prepoznavanje naloga, obaveštenja ili sigurnosnu verifikaciju kada je potrebno.",
          gatewayReadTitle: "Pristup zaštićenim poslovnim API-jem",
          gatewayReadDesc:
            "Omogućava aplikaciji da pristupa zaštićenim resursima kao vaš autorizovani identitet.",
          customTitle: "Traženje dozvole: {{scope}}",
          customDesc:
            "Ova aplikacija traži dodatnu poslovnu dozvolu. Pažljivo je pregledajte pre nastavka.",
        },
      },
      sessionConflict: {
        title: "U ovom pretraživaču su detektovani različiti nalazi",
        desc: "Nalog zapamćen ovim prozorom ne odgovara trenutno aktivnom nalogu u pretraživaču. U istom pretraživaču u isto vreme može ostati aktivan samo jedan glavni nalog. Odaberite nalog sa kojim ćete nastaviti.",
        browserAccount: "Aktivan nalog pretraživača",
        thisWindowAccount: "Prethodni nalog ovog prozora",
        useBrowserAccount: "Koristite aktivni nalog pretraživača",
        useThisWindowAccount: "Vratite se na nalog ovog prozora",
        relogin: "Odjavite se i prijavite se ponovo",
      },
    },
    nav: {
      security: "Prijava i sigurnost",
      profile: "Profil",
      privacy: "Centar privatnosti",
      bindings: "Autorizovane aplikacije",
      help: "Centar za pomoć",
    },
    common: {
      loadingFailed: "Neuspešno učitavanje",
      revokeFailed: "Neuspešno povlačenje saglasnosti",
      revokeSuccess: "Saglasnost je povučena",
      confirm: "Potvrdite",
      sendCode: "Pošalji kod",
      sendCodeSuccess: "Verifikacioni kod je uspešno poslat",
      sendingCode: "Slanje",
      save: "Sačuvajte",
      saving: "Čuvanje",
      edit: "Izmenite",
      cancel: "Otkažite",
      uploadAvatar: "Postavite avatar",
      avatarUpdated: "Avatar je ažuriran",
      avatarUploadFailed: "Neuspešno postavljanje avatara",
      profileUpdated: "Profil je ažuriran",
      profileUpdateFailed: "Neuspešno ažuriranje profila",
      imageReadFailed: "Neuspešno čitanje slike",
      imageProcessUnsupported:
        "Obrada slike nije podržana u ovom pretraživaču",
      avatarConvertFailed: "Neuspešno konvertovanje avatara",
      unset: "Nije postavljeno",
      unsetShort: "Nije postavljeno",
      notFilled: "Nije uneto",
      noRecord: "Nema zapisa",
      normal: "Aktivan",
      accountCenter: "Centar naloga",
      noAuthorizedApps: "Nema autorizovanih aplikacija",
    },
    errors: {
      emailRequiredByServer: "Unesite vašu e-adresu",
      passwordRequiredByServer: "Unesite vašu lozinku",
      invalidCredentials: "Nevažeći nalog ili poverenje",
      invalidOtpCode: "Verifikacioni kod je nevažeći ili je istekao",
      accountFrozen: "Ovaj nalog je friziran",
      accountFrozenWithReason:
        "Ovaj nalog je friziran. Razlog: {{reason}}",
      userNotFound: "Korisnik nije pronađen",
      smsNotConfigured: "Slanje SMS-ova nije konfigurisano",
      smtpNotConfigured: "Slanje e-pošte nije konfigurisano",
      userStatusInvalid:
        "Trenutni status naloga ne dozvoljava ovu akciju",
      invalidCurrentPhoneVerificationCode:
        "Trenutni verifikacioni kod telefona je nevažeći ili je istekao",
      invalidNewPhoneVerificationCode:
        "Novi verifikacioni kod telefona je nevažeći ili je istekao",
      currentPhoneVerificationCodeRequired:
        "Unesite verifikacioni kod trenutnog telefona",
      currentPhoneNotBound:
        "Na ovaj nalog trenutno nije povezan broj telefona",
      phoneDoesNotMatchCurrentBoundPhone:
        "Broj telefona se ne podudara sa trenutno vezanim",
      phoneAlreadyBound: "Ovaj broj telefona je već povezan",
      newPhoneMustBeDifferent:
        "Novi broj telefona mora biti različit od trenutnog",
      phoneAndVerificationCodeRequired:
        "Unesite broj telefona i novi verifikacioni kod telefona",
      invalidMfaCode: "Dvostruki verifikacioni kod je nevažeći ili je istekao",
      unsupportedMfaMethod: "Nepodržana metoda dvostruke autentifikacije",
      mfaNotEnabled:
        "Dvostruka autentifikacija nije omogućena za ovaj nalog",
      emailNotBound: "Na ovaj nalog nije povežana e-adresa",
      phoneNotBound: "Na ovaj nalog nije povezan broj telefona",
      emailVerificationCodeRequired: "Unesite verifikacioni kod e-pošte",
      invalidEmailVerificationCode:
        "Verifikacioni kod e-pošte je nevažeći ili je istekao",
      phoneVerificationCodeRequired: "Unesite verifikacioni kod telefona",
      invalidPhoneVerificationCode:
        "Verifikacioni kod telefona je nevažeći ili je istekao",
      newPasswordMustBeDifferentFromCurrentPassword:
        "Nova lozinka mora biti različita od trenutne",
      phoneBindingChallengeExpired:
        "Sesija povezivanja telefona je istekla. Molimo prijavite se ili se registrujte ponovo.",
      manualMfaCodeNotSendable:
        "Ovaj nalog koristi ručni MFA kod i ne može poslati kod",
      emailAndPasswordRequired:
        "Unesite vašu e-adresu i lozinku pre nego što zatražite dvostruki kod",
      mfaChallengeExpiredOrInvalid:
        "Sesija dvostruke verifikacije je istekla. Molimo prijavite se ponovo.",
      challengeRequired:
        "Završite sigurnosni izazov pre nego što zatražite kod.",
      captchaRequired:
        "Volumen zahteva je visok. Prvo završite sigurnosnu proveru.",
      rateLimitExceeded: "Previše zahteva. Molimo pokušajte ponovo kasnije.",
      circuitOpen:
        "Kanal za slanje je privremeno zaštićen. Molimo pokušajte ponovo kasnije.",
      cooldownActive:
        "Ovaj cilj je zatražio kodove previše često. Molimo pokušajte ponovo kasnije.",
      passkeyChallengeExpired: "Sesija passkey-a je istekla. Molimo pokušajte ponovo.",
      passkeyVerificationFailed:
        "Verifikacija passkey-a nije uspela. Pokušajte ponovo ili koristite drugu metodu prijave.",
      passkeyAlreadyExists: "Ovaj passkey je već povezan.",
      passkeyNotFound: "Passkey nije pronađen.",
      passkeyBrowserUnsupported:
        "Ovaj pretraživač ili uređaj ne podržava passkey-e.",
      passkeyUserHandleInvalid:
        "Nije moguće prepoznati nalog za ovaj passkey.",
      invalidLoginStepUpVerificationCode:
        "Dodatni verifikacioni kod je nevažeći ili je istekao.",
      loginStepUpChallengeExpiredOrInvalid:
        "Sesija dodatne verifikacije je istekla. Molimo prijavite se ponovo.",
      mfaEnrollmentChallengeExpiredOrInvalid:
        "Sesija prisilne registracije MFA je istekla. Molimo prijavite se ponovo.",
      noAvailableMfaMethodForCurrentAccount:
        "Za ovaj nalog nema dostupne metode MFA.",
      noAvailableLoginVerificationTargetForCurrentAccount:
        "Za ovaj nalog nema dostupnog cilja za dodatnu verifikaciju.",
    },
    security: {
      loginMethods: "Metode prijave",
      phone: "Povežite broj telefona",
      phoneDesc:
        "Koristi se za dodatne metode prijave, SMS verifikaciju i obaveštenja o sigurnosti naloga",
      bindPhone: "Povežite",
      bindPhoneTitle: "Povežite broj telefona",
      bindPhoneHint:
        "Pre povezivanja prvo verifikujte broj telefona. Verifikacioni kod će biti poslat na taj broj telefona.",
      rebindPhoneHint:
        "Da biste zamenili povezan broj telefona, prvo verifikujte trenutni broj telefona, a zatim novi.",
      currentPhone: "Trenutno povezan broj telefona",
      currentPhoneCode: "Trenutni verifikacioni kod telefona",
      currentPhoneCodePlaceholder:
        "Unesite 6-cifreni kod poslat na trenutni broj telefona",
      sendCurrentPhoneCode: "Pošalji trenutni kod telefona",
      newPhone: "Broj telefona",
      newPhoneCode: "Novi verifikacioni kod telefona",
      newPhonePlaceholder: "Unesite broj telefona, na primer 13800138000",
      smsCode: "Verifikacioni kod SMS-a",
      smsCodePlaceholder: "Unesite 6-cifreni kod SMS-a",
      safeEmail: "Sigurna e-adresa",
      safeEmailDesc: "Primarno poverenje korisničko ime za prijavu",
      editEmailTitle: "Promenite sigurnu e-adresu",
      newEmail: "Nova e-adresa",
      newEmailPlaceholder: "Unesite novu e-adresu",
      emailCode: "Kod e-pošte",
      emailCodePlaceholder: "Unesite 6-cifreni kod",
      changeEmailHint:
        "Nova e-adresa mora biti verifikovana pre nego što se promena sačuva.",
      changePassword: "Promenite lozinku",
      changePasswordDesc:
        "Redovno ažurirajte lozinku za prijavu da biste poboljšali sigurnost naloga",
      editPasswordTitle: "Promenite lozinku za prijavu",
      currentPassword: "Trenutna lozinka",
      currentPasswordPlaceholder: "Unesite vašu trenutnu lozinku",
      currentPasswordIncorrect: "Trenutna lozinka je netačna",
      newPassword: "Nova lozinka",
      newPasswordPlaceholder: "Unesite novu lozinku sa najmanje 8 karaktera",
      confirmPassword: "Potvrdite novu lozinku",
      confirmPasswordPlaceholder: "Ponovo unesite novu lozinku",
      changePasswordHint:
        "Sledeći put kada se prijavite, koristite novu lozinku, i izbegavajte ponavljanje stare.",
      passwordMinLength: "Lozinka mora imati najmanje 8 karaktera",
      passwordMismatch: "Dve nove lozinke se ne podudaraju",
      passwordUpdated: "Lozinka je ažurirana",
      passwordUpdateFailed: "Neuspešno ažuriranje lozinke",
      mfa: "Dvostruka autentifikacija",
      mfaDesc: "Kada je omogućena, zahteva se dodatna verifikacija prilikom prijave",
      mfaTitle: "Konfigurišite dvostruku autentifikaciju",
      mfaHint: "Odaberite drugu metodu verifikacije koristenu prilikom prijave.",
      mfaTitleEnable: "Omogućite dvostruku autentifikaciju",
      mfaTitleDisable: "Onemogućite dvostruku autentifikaciju",
      mfaHintEnable:
        "Odaberite drugu metodu verifikacije koristenu prilikom prijave.",
      mfaHintDisable:
        "Nakon onemogućavanja, dodatna verifikacija više neće biti potrebna prilikom prijave.",
      mfaMethod: "Metoda verifikacije",
      mfaMethodEmail: "Kod e-pošte",
      mfaMethodSMS: "Kod telefona",
      passkeys: "Passkey-e",
      passkeysDesc:
        "Nakon povezivanja, možete se prijaviti direktno iz sistemskog izabirača passkey-a.",
      addPasskey: "Dodajte passkey",
      deletePasskey: "Obrišite passkey",
      passkeyName: "Ime uređaja",
      passkeyNamePlaceholder: "Unesite prepoznatljivo ime",
      passkeyLastUsed: "Poslednje korišćenje",
      passkeyLastUsedIP: "Poslednji korišćeni IP",
      passkeyCreatedAt: "Kreirano u",
      passkeyEmpty: "Nema povezanih passkey-a",
      passkeyManageVerify:
        "Da biste zaštitili vaš nalog, verifikujte svoje trenutne poverenje pre dodavanja ili brisanja passkey-a.",
      currentMfaCode: "Trenutni MFA kod",
      currentMfaCodePlaceholder: "Unesite kod iz trenutne MFA metode",
      currentMfaCodeHintEmail:
        "Završite verifikaciju sa trenutno povezanim kodom e-pošte pre čuvanja.",
      currentMfaCodeHintSMS:
        "Završite verifikaciju sa trenutno povezanim kodom telefona pre čuvanja.",
      currentMfaCodeHintManual:
        "Unesite trenutno konfigurisani ručni MFA kod pre čuvanja.",
      accountSecurity: "Sigurnost naloga",
      recentLogin: "Poslednja prijava",
      recentLoginDesc: "Vreme poslednje uspešne prijave i IP uređaja",
    },
    profile: {
      title: "Profil",
      avatar: "Avatar",
      avatarDesc:
        "Slika će biti automatski isečena u centar i konvertovana u webp format",
      nickname: "Nadimak",
      nicknameDesc: "Trenutno prikazano ime",
      gender: "Pol",
      genderDesc: "Informacije o polu profila za ovaj nalog",
      languagePreference: "PREFERENCA JEZIKA",
      languagePreferenceDesc:
        "Nakon prijave, ovaj jezik će se prvo koristiti za sadržaj stranice",
      languagePreferenceSaved: "PREFERENCA JEZIKA JE SAČUVANA",
      languagePreferenceSaveFailed: "NEUSPESNO SAČUVANJE PREFERENCE JEZIKA",
      genderMale: "Muški",
      genderFemale: "Ženski",
      genderOther: "Ostalo",
      userId: "ID korisnika",
      userIdDesc: "Jedinstveni identifikator trenutnog naloga u sistemu",
      nicknamePlaceholder: "Unesite nadimak",
      editNicknameTitle: "Izmenite nadimak",
      editGenderTitle: "Izmenite pol",
      email: "E-adresa",
      emailDesc: "Koristi se za prijavu, verifikaciju i obaveštenja o sigurnosti",
      createdAt: "Registrovan u",
      createdAtDesc: "Vreme kada je ovaj nalog kreiran",
      country: "Zemlja registracije",
      countryDesc: "Zemlja ili region zabeležen prilikom registracije",
    },
    privacy: {
      title: "Centar privatnosti",
      exportTitle: "Preuzmite korisničke podatke",
      exportDesc:
        "Izvezite podatke profila i neopovučene autorizovane aplikacije u CSV formatu.",
      exportAction: "Preuzmite podatke",
      exportPasswordVerifyDesc:
        "Verifikujte vašu trenutnu lozinku za prijavu pre preuzimanja. CSV će sadržati podatke profila i neopovučene autorizovane aplikacije.",
      exportSuccess: "Preuzimanje korisničkih podataka je počelo",
      exportFailed: "Neuspešno izvozivanje korisničkih podataka",
      minimizeTitle: "Minimizacija podataka",
      minimizeDesc:
        "Sistem čuva samo zemlju registracije, e-adresu, saglasnosti i esencijalne podatke o sigurnosti prijave.",
      scopeTitle: "Trenutni opseg pristupa",
      scopeDesc:
        "Možete pregledati aplikacije koje su pristupile vašem nalogu u Autorizovanim aplikacijama i povući im pristup u bilo kom trenutku.",
      statusTitle: "Status naloga",
      statusDesc:
        "Ako je nalog friziran, prijava će biti blokirana dok administrator ne reši problem.",
      deleteTitle: "Obrišite nalog",
      deleteDesc:
        "Ako se ponovo prijavite u roku od 7 dana, zahtev za brisanje se automatski otkazuje. U suprotnom će se nalog i podaci o saglasnosti ukloniti.",
      deleteWarningPrimary:
        "Brisanje naloga je nepovratna akcija. Pre nego što to uradite, sačuvajte sve podatke povezane sa ovim nalogom.",
      deleteWarningSecondary:
        "Nakon podnošenja zahteva, ponovna prijava u roku od 7 dana otkazuje brisanje. Ako se ne prijavite u roku od 7 dana, sistem automatski briše nalog i podatke o saglasnosti.",
      deleteAction: "Pročitao sam i prihvatam posledice",
      passwordVerifyTitle: "Verifikujte trenutnu lozinku",
      passwordVerifyDesc:
        "Unesite vašu trenutnu lozinku za prijavu i završite verifikaciju e-pošte. Ako je povezan broj telefona, takođe je potrebna verifikacija telefona.",
      emailVerifyCode: "Verifikacioni kod e-pošte",
      emailVerifyCodePlaceholder: "Unesite 6-cifreni kod poslat na vašu e-adresu",
      sendDeleteEmailCode: "Pošalji kod e-pošte",
      sendDeleteEmailCodeSuccess:
        "Verifikacioni kod e-pošte je poslat. Proverite svoj e-poštovni sandućević.",
      sendDeleteEmailCodeFailed: "Neuspešno slanje verifikacionog koda e-pošte",
      phoneVerifyCode: "Verifikacioni kod telefona",
      phoneVerifyCodePlaceholder: "Unesite 6-cifreni kod poslat na vaš telefon",
      sendDeletePhoneCode: "Pošalji kod telefona",
      sendDeletePhoneCodeSuccess:
        "Verifikacioni kod telefona je poslat. Proverite svoj telefon.",
      sendDeletePhoneCodeFailed: "Neuspešno slanje verifikacionog koda telefona",
      confirmDeleteNow: "Podnesite zahtev za brisanje",
      deleteSuccess:
        "Zahtev za brisanje je podnet. Prijava u roku od 7 dana će ga otkazati.",
      deleteFailed: "Neuspešno podnošenje zahteva za brisanje",
      deletePendingAt:
        "Zahtev za brisanje je podnet. Planirano vreme brisanja: {{date}}",
    },
    bindings: {
      title: "Autorizovane aplikacije",
      appId: "Naziv aplikacije",
      scopes: "Dozvole",
      createdAt: "Autorizovano u",
      authorizedAt: "Autorizovano u",
      action: "Akcija",
      viewDetails: "Detalji",
      detailTitle: "Detalji autorizacije",
      siteName: "Autorizovani sajt",
      requestedPermissions: "Dodeljene dozvole",
      scopeOpenIdTitle: "Potvrdite vaš identitet",
      scopeOpenIdDesc:
        "Koristi se za potvrdu da li je prijavljeni nalog zaista vi i za uspostavljanje osnovne sesije prijave.",
      scopeProfileTitle: "Pristup vašem javnom profilu",
      scopeProfileDesc:
        "Uključuje nadimak, avatar i druge podatke o javnom profilu za prikaz unutar aplikacije.",
      scopeEmailTitle: "Pristup vašoj e-adresi",
      scopeEmailDesc:
        "Koristi se za prikaz vaše e-adrese naloga ili slanje obaveštenja i povezivanje naloga kada je potrebno.",
      scopePhoneTitle: "Pristup vašem broju telefona",
      scopePhoneDesc:
        "Koristi se za prepoznavanje naloga, obaveštenja ili sigurnosnu verifikaciju kada je potrebno.",
      scopeGatewayReadTitle: "Pristup zaštićenim poslovnim API-jem",
      scopeGatewayReadDesc:
        "Omogućava aplikaciji da pristupa zaštićenim API resursima u vaše ime nakon autorizacije.",
      scopeCustomTitle: "Traženje dozvole: {{scope}}",
      scopeCustomDesc:
        "Ova aplikacija traži dodatnu poslovnu dozvolu. Pažljivo je pregledajte pre nastavka.",
      revoke: "Povuci",
      batchRevoke: "Grupno povlačenje",
      batchRevokeConfirmTitle: "Potvrdite grupno povlačenje?",
      batchRevokeConfirmDesc:
        "Izabrano je {{count}} autorizacija. Ove aplikacije će morati ponovo da traže saglasnost.",
    },
    help: {
      title: "Centar za pomoć",
      loginIssueTitle: "Ne možete se prijaviti",
      loginIssueDesc:
        "Ako ne možete da se prijavite, prvo potvrdite da koristite ispravnu metodu za nalog, kao što su lozinka, kod e-pošte, kod telefona ili passkey. Ako se verifikacioni kod odbije, proverite da li je to najnoviji kod i da li je još uvek u roku važenja. Ako se nalog prikaže kao friziran, u čekanju na aktivaciju ili na drugi način ograničen, problem mora biti rešen od strane administratora platforme. Ako ste nedavno podneli zahtev za brisanje naloga, sistem takođe može zahtevati potvrdu brisanja ili povezivanje telefona pre nego što se pristup obnoviti.",
      protectTitle: "Zaštitite vaš nalog",
      protectDesc:
        "Omogućite dvostruku autentifikaciju što je pre moguće i povežite passkey-e na pouzdanim uređajima da biste smanjili rizik od kompromitovanja samo lozinke. Nikada nemojte deliti kodove e-pošte, SMS kodove ili MFA kodove sa trećim stranama, i ne ponovo unosi poverenje na stranicama koje ne verujete. Ako koristite isti nalog na više uređaja, redovno pregledajte poslednje prijave, povezane passkey-e i autorizovane aplikacije, i uklanjajte uređaje ili autorizacije koje više ne koristite.",
      authIssueTitle: "Problemi sa autorizacijom",
      authIssueDesc:
        "Ako aplikacija izgleda nepoznato, traži neobične dozvole ili sumnjate da ga zlouporablja vaš nalog, otvorite Autorizovane aplikacije da biste pregledali vreme autorizacije, dodeljene dozvole i detalje integracije, a zatim ga odmah povucete ako je potrebno. Nakon povlačenja, aplikacija više neće moći da pristupa zaštićenim resursima sa vašim nalogom dok se ponovo ne prijavite i ne odobrite novi zahtev za saglasnost. Ako problem može uticati na ceo nalog, a ne samo jednu aplikaciju, takođe biste trebali promeniti lozinku, proveriti postavke MFA i pregledati poslednje aktivnosti prijave i passkey-a.",
      contactTitle: "Kontaktirajte nas",
      contactDesc:
        "Ako vam je potrebna ručna podrška, možete se kontaktirati sa kontaktom za podršku platforme ispod. Kada prijavljate problem, uključite e-adresu naloga, vreme kada se problem pojavio, snimke ekrana sa porukama o greškama, metodu prijave koju ste koristili i relevantne detalje o uređaju ili pretraživaču kako bi se problem brže istražio.",
      contactMainlandTitle: "Kineska glavna zemlja",
      contactOverseasTitle: "Inostranstvo",
      contactPersonLabel: "Osoba za kontakt:",
      contactPhoneLabel: "Telefon:",
      contactEmailLabel: "Email:",
      contactHoursLabel: "Sati podrške:",
      contactMainlandPersonValue: "YOUR_NAME",
      contactMainlandPhoneValue: "YOUR_PHONE_NUMBER",
      contactMainlandEmailValue: "YOUR_EMAIL",
      contactMainlandHoursValue: "Ponedeljak do petak 09:00 - 18:00",
      contactOverseasPersonValue: "Za dodavanje",
      contactOverseasPhoneValue: "Za dodavanje",
      contactOverseasEmailValue: "Za dodavanje",
      contactOverseasHoursValue: "Ponedeljak do petak 09:00 - 18:00",
      contactRegionNotice:
        "Prvo kontaktirajte kanal podrške za vaš region. Ako niste sigurni koji region se odnosi na vas, počnite sa kontaktom za Kinesku glavnu zemlju za pomoć u usmeravanju.",
      contactNotice:
        "Za probleme kao što su frizirani nalazi, nenormalne autorizacije, izgubljeni passkey-i ili povratak iz brisanja, prvo kontaktirajte administratora putem gore navedenog broja telefona ili e-pošte. Ako vaša platforma nudi službeni sistem za tikete, tablu sa obaveštenjima ili operativnu grupu, prvo slijedite taj službeni kanal.",
    },
  },
} as const;

export default locale;