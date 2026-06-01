const locale = {
  translation: {
    header: {
      language: "Sprog",
      languageModalTitle: "Vælg sprog",
      languageModalDesc: "Vælg det grænsefladesprog, du vil bruge.",
      agreement: "Brugeraftale",
      privacy: "Privatlivspolitik",
      help: "Hjælpecenter",
      logout: "Log ud",
      accountCenter: "Kontocenter",
    },
    legal: {
      back: "Tilbage til startsiden",
      updatedAt: "Sidst opdateret: {{date}}",
      agreement: {
        title: "Brugeraftale",
        updatedAt: "2026-03-16",
        intro:
          "Velkommen til {{siteName}}. Før du registrerer dig, logger ind, integrerer eller bruger de samlede identitetstjenester, skal du læse denne aftale omhyggeligt. Ved at fortsætte med at bruge tjenesten accepterer du at være bundet af denne aftale.",
        sections: {
          accountTitle: "1. Konto og login",
          accountP1:
            "Du skal give sande, lovlige og tilgængelige registreringsoplysninger og holde din konto, adgangskode, bekræftelseskoder og andre legitimationsoplysninger ordentligt beskyttet. Du er ansvarlig for tab forårsaget af dårlig håndtering af legitimationsoplysninger på din side.",
          accountP2:
            "Hvis der registreres unormal loginaktivitet, overtrædelse af politikker, frossen status eller sikkerhedsrisici, kan platformen kræve yderligere verifikation, begrænse login eller suspendere adgang af sikkerhedsmæssige årsager.",
          acceptableUseTitle: "2. Acceptabel brug",
          acceptableUseP1:
            "Du må ikke bruge dette system til ulovlig aktivitet, krænkelse af rettigheder, misbrug af autentificeringsgrænseflader, masseanmodninger, credential stuffing eller adfærd, der truer platformstabilitet eller omgår sikkerhedskontroller.",
          acceptableUseP2:
            "Hvis du overtræder denne aftale eller relaterede regler, kan platformen suspendere eller afslutte hele eller dele af din adgang og forbeholder sig ret til at forfølge ansvar, når det er nødvendigt.",
          authorizationTitle: "3. Autorisation og tredjepartsapps",
          authorizationP1:
            "Når du bruger en {{siteName}}-konto til at logge ind på en tredjepartsapp, vil systemet bede om dit samtykke baseret på tilladelserne vist på autorisationssiden. Du kan afvise eller tilbagekalde det samtykke når som helst i kontocentret.",
          authorizationP2:
            "Enhver brug af dine data af en tredjepartsapp efter autorisation styres af den pågældende apps egne servicevilkår og privatlivspolitik. Platformen vil kun påtage sig ansvar inden for det omfang, der kræves af loven.",
          developerTitle: "4. Udviklerintegration",
          developerP1:
            "Udviklere skal sikre, at appoplysninger, omdirigerings-URI'er, anmodede omfang og forretningsformål er sande, komplette og kontinuerligt gyldige, og må ikke vildlede brugerne.",
          developerP2:
            "Platformen kan gennemgå, afvise, fjerne, slette eller begrænse tilsluttede apps for at opretholde sikkerheden og integriteten af det samlede identitetsøkosystem.",
          liabilityTitle: "5. Serviceændringer og ansvarsbegrænsning",
          liabilityP1:
            "Af sikkerheds-, compliance-, drifts- eller vedligeholdelsesmæssige årsager kan platformen justere, opgradere, suspendere eller afslutte visse grænseflader, processer eller funktioner og vil forsøge at give besked, når det er passende.",
          liabilityP2:
            "I det omfang loven tillader det, er platformen ikke ansvarlig ud over lovmæssige forpligtelser for afbrydelser, unormale data eller tab forårsaget af force majeure, netværksfejl, tredjepartsårsager eller forkert brug fra din side.",
        },
      },
      privacy: {
        title: "Privatlivspolitik",
        updatedAt: "2026-03-16",
        intro:
          "{{siteName}} værdsætter dine personlige oplysninger og kontosikkerhed. Denne politik forklarer, hvordan vi indsamler, bruger, gemmer, deler og beskytter dine oplysninger, samt de rettigheder, der er tilgængelige for dig.",
        sections: {
          dataCollectionTitle: "1. Oplysninger vi indsamler",
          dataCollectionP1:
            "Når du registrerer dig, logger ind eller bruger kontotjenester, kan vi indsamle dit registreringsland, e-mailadresse, telefonnummer, adgangskodehash, loginsessioner, enheds-IP, autorisationsoversigter og nødvendige sikkerhedslogfiler.",
          dataCollectionP2:
            "Når du uploader en avatar, ændrer din profil, binder et telefonnummer, aktiverer MFA eller autoriserer en tredjepartsapp, behandler vi de oplysninger, du indsender, efter behov for at levere den pågældende funktion.",
          dataUsageTitle: "2. Hvordan vi bruger oplysninger",
          dataUsageP1:
            "Vi bruger relevante oplysninger til at levere kontoregistrering, loginautentifikation, levering af bekræftelseskoder, risikokontrol, autorisationsbekræftelse, udviklerapp-gennemgang, kontosikkerhedsmeddelelser og vedligeholdelse af servicetilgængelighed.",
          dataUsageP2:
            "Vi analyserer også logfiler og statistikker på et minimumsnødvendigt grundlag for at opdage unormal aktivitet, forbedre produktoplevelsen og styrke sikkerheden.",
          dataSharingTitle: "3. Deling og videregivelse",
          dataSharingP1:
            "Vi giver kun identitetsoplysninger eller tilladelsesrelaterede data til tredjepartsapps, når du udtrykkeligt autoriserer de omfang, der vises på autorisationssiden.",
          dataSharingP2:
            "Bortset fra hvor det kræves ved lov, reguleringsanmodninger, beskyttelse af offentlige interesser eller systemsikkerhedsbehov, sælger eller deler vi ikke ulovligt dine personlige oplysninger med urelaterede tredjeparter.",
          userRightsTitle: "4. Dine rettigheder",
          userRightsP1:
            "Du kan gennemse og opdatere din profil, bindinger, autorisationsoversigter og sikkerhedsindstillinger i kontocentret, og du kan tilbagekalde appsamtykker eller indsende en kontosletningsanmodning.",
          userRightsP2:
            "Hvis du mener, at dine oplysninger er unøjagtige, behandlet forkert eller brugt ud over nødvendigheden, kan du kontakte platformoperatøren eller udøve dine rettigheder i henhold til gældende lov.",
          securityTitle: "5. Beskyttelse og opbevaring",
          securityP1:
            "Vi bruger adgangskontroller, adgangskodehashing, udløb af bekræftelseskoder, revisionslogfiler og dataminimeringsforanstaltninger til at beskytte dine personlige oplysninger og autentifikationsdata.",
          securityP2:
            "Under hensyntagen til lovmæssige og forretningsmæssige krav opbevarer vi dine oplysninger kun så længe som nødvendigt for at opfylde serviceformålene; efter kontosletning eller udløb af opbevaringsperioder vil vi slette eller anonymisere data i henhold til politikken.",
        },
      },
    },
    auth: {
      noAccount: "Ingen konto?",
      registerNow: "Registrer dig nu",
      registerPageTitle: "Opret konto",
      registerPageSubtitle:
        "Gennemfør registrering med dit land, e-mail og e-mail-bekræftelseskode.",
      registerDisabled: "Registrering er i øjeblikket deaktiveret",
      registerSuccess:
        "Registrering vellykket. Log venligst ind med din adgangskode.",
      phoneBindingRequiredAfterRegister:
        "Registrering lykkedes. Bind venligst dit telefonnummer for at aktivere kontoen først.",
      registerFailed: "Registrering mislykkedes",
      country: "Land",
      countryRequired: "Vælg et land",
      registerCode: "E-mail-kode",
      registerCodeRequired: "Indtast e-mail-bekræftelseskoden",
      registerCodePlaceholder: "Indtast den 6-cifrede kode",
      sendRegisterCode: "Send kode",
      sendRegisterCodeSuccess:
        "Bekræftelseskoden er blevet sendt. Tjek venligst din indbakke.",
      sendRegisterCodeFailed: "Kunne ikke sende bekræftelseskode",
      backToLoginWithAccount: "Har du allerede en konto? Log ind",
      forgotPassword: "Glemt adgangskode?",
      forgotPasswordPageTitle: "Nulstil adgangskode",
      forgotPasswordPageSubtitle:
        "Nulstil din login-adgangskode med din registrerede e-mail og bekræftelseskode.",
      forgotPasswordPrompt: "Glemt din adgangskode?",
      forgotPasswordAction: "Gendan den",
      forgotPasswordDesc:
        "Efter at have bekræftet din e-mail med en kode kan du indstille en ny login-adgangskode direkte.",
      forgotPasswordHint:
        "Indtast din registrerede e-mail, bekræftelseskoden og en ny adgangskode. Du kan logge ind med den nye adgangskode med det samme efter indsendelse.",
      goToOtpLogin: "Brug e-mail-kode login",
      resetCode: "Gendannelseskode",
      sendResetCode: "Send gendannelseskode",
      sendResetCodeSuccess:
        "Gendannelseskoden er blevet sendt. Tjek venligst din indbakke.",
      sendResetCodeFailed: "Kunne ikke sende gendannelseskode",
      resetPassword: "Nulstil adgangskode",
      resetPasswordSuccess:
        "Adgangskoden er nulstillet. Log venligst ind med din nye adgangskode.",
      resetPasswordFailed: "Kunne ikke nulstille adgangskode",
      newPassword: "Ny adgangskode",
      confirmNewPassword: "Bekræft ny adgangskode",
      newPasswordPlaceholder: "Indtast en adgangskode med mindst 8 tegn",
      confirmPassword: "Bekræft adgangskode",
      confirmPasswordPlaceholder: "Indtast adgangskoden igen",
      backToLogin: "Tilbage til login",
      emailRequired: "Indtast din e-mail",
      passwordRequired: "Indtast din adgangskode",
      otpCodeRequired: "Indtast e-mail-bekræftelseskoden",
      phoneRequired: "Indtast dit telefonnummer",
      phoneOtpCodeRequired: "Indtast SMS-bekræftelseskoden",
      emailInvalid: "Indtast en gyldig e-mailadresse",
      resetCodeRequired: "Indtast gendannelseskoden",
      resetCodePlaceholder: "Indtast den 6-cifrede gendannelseskode",
      newPasswordRequired: "Indtast en ny adgangskode",
      confirmNewPasswordRequired: "Bekræft den nye adgangskode igen",
      newPasswordMinLength: "Ny adgangskode skal være mindst 8 tegn",
      passwordMinLength: "Adgangskode skal være mindst 8 tegn",
      newPasswordMismatch: "De to nye adgangskoder matcher ikke",
      passwordMismatch: "De to adgangskoder matcher ikke",
      registrationClosed: "Registrering er i øjeblikket lukket",
      login: "Log ind",
      passkeyLogin: "Adgangsnøgle",
      passkeyLoginDesc:
        "Brug en adgangsnøgle, der allerede er bundet til dette websted på din enhed eller systemkonto.",
      passkeyLoginButton: "Brug adgangsnøgle",
      passkeyLoginHint:
        "Du skal binde en adgangsnøgle i kontocentret, før du bruger den her.",
      passkeyLoginSuccess: "Adgangsnøgle tilføjet med succes",
      passkeyNotAvailable:
        "Ingen adgangsnøgle til dette websted er tilgængelig på denne enhed. Brug en anden loginmetode.",
      passwordLogin: "Adgangskode",
      otpLogin: "E-mail-kode",
      phoneOtpLogin: "Telefonkode",
      email: "E-mail",
      phone: "Telefonnummer",
      password: "Adgangskode",
      otpCode: "E-mail-kode",
      phoneOtpCode: "SMS-kode",
      mfaCode: "2FA-kode",
      mfaPlaceholder: "Lad være blank, hvis tofaktorgodkendelse ikke er aktiveret",
      sendOtpCode: "Send e-mail-kode",
      sendOtpCodeSuccess:
        "E-mail-koden er blevet sendt. Tjek venligst din indbakke.",
      sendOtpCodeFailed: "Kunne ikke sende bekræftelseskode",
      sendOtpCodeEmailRequired: "Indtast din e-mail, før du anmoder om en kode",
      sendPhoneOtpCode: "Send SMS-kode",
      sendPhoneOtpCodeSuccess:
        "SMS-koden er blevet sendt. Tjek venligst din telefon.",
      sendPhoneOtpCodeFailed: "Kunne ikke sende SMS-kode",
      sendPhoneBindingCode: "Send bindingskode",
      sendPhoneBindingCodeSuccess:
        "Telefonbindingskoden er blevet sendt. Tjek venligst din telefon.",
      sendPhoneBindingCodeFailed: "Kunne ikke sende telefonbindingskoden",
      securityCaptcha: "Sikkerhedskontrol",
      securityCaptchaPlaceholder:
        "Indtast sikkerhedskontrolværdien, og prøv igen",
      securityCaptchaHelp:
        "Når den aktuelle enhed eller IP sender anmodninger for ofte, skal du gennemføre denne sikkerhedskontrol, før du anmoder om en anden kode.",
      securityCaptchaRequiredTip:
        "Anmodningsvolumen er højt. Gennemfør sikkerhedskontrollen, før du anmoder om en anden kode.",
      sendOtpCodePhoneRequired:
        "Indtast dit telefonnummer, før du anmoder om en kode",
      phoneBindingPageTitle: "Bind telefonnummer",
      phoneBindingRegisterDesc:
        "Denne konto ramte risikoreglen efter registrering. Bind et telefonnummer, før du fortsætter.",
      phoneBindingLoginDesc:
        "Denne konto ramte risikoreglen ved login. Bind et telefonnummer, før du fortsætter.",
      completePhoneBinding: "Bind og fortsæt",
      phoneBindingSuccess:
        "Telefonnummer bundet med succes. Kontoen er aktiv igen.",
      mfaVerifyTitle: "Tofaktorgodkendelse",
      mfaVerifyEmailHint:
        "En bekræftelseskode blev sendt til {{target}}. Indtast den for at fortsætte med at logge ind.",
      mfaVerifyPhoneHint:
        "En bekræftelseskode blev sendt til {{target}}. Indtast den for at fortsætte med at logge ind.",
      loginStepUpTitle: "Ekstra loginbekræftelse",
      loginStepUpEmailDesc:
        "Dette login kræver yderligere e-mailbekræftelse. En kode vil blive sendt til {{email}}.",
      loginStepUpSMSDesc:
        "Dette login kræver yderligere telefonbekræftelse. En kode vil blive sendt til {{phone}}.",
      loginStepUpDualDesc:
        "Dette login kræver både e-mail- og telefonbekræftelse. E-mail: {{email}}, telefon: {{phone}}.",
      loginStepUpExpired:
        "Ekstra loginbekræftelsessessionen er udløbet. Log venligst ind igen.",
      forcedMfaEnrollmentTitle: "Tofaktorgodkendelse skal aktiveres",
      forcedMfaEnrollmentDesc:
        "En administrator kræver, at denne konto aktiverer tofaktorgodkendelse, før dette login kan afsluttes.",
      forcedMfaEnrollmentExpired:
        "Tvungen MFA-registreringssession er udløbet. Log venligst ind igen.",
      completeForcedMfaEnrollment: "Aktiver og fortsæt",
      cancelForcedMfaEnrollment: "Annuller og returner til login",
      verifyAndLogin: "Bekræft og log ind",
      deletionConfirmTitle: "Kontosletningsanmodning indsendt",
      deletionConfirmScheduledAt: "Planlagt sletningstidspunkt: {{date}}",
      deletionConfirmDesc:
        "Hvis du logger ind igen, vil sletningen blive annulleret.",
      deletionConfirmContinue: "Fortsæt og annuller sletning",
      deletionConfirmExpired: "Bekræftelse udløbet, log venligst ind igen",
      deletionConfirmFailed: "Bekræftelse mislykkedes, log venligst ind igen",
      logoutProgressTitle: "Logger ud",
      logoutProgressDesc:
        "Identitetssessionen er ryddet, og tilsluttede applikationer logges ud.",
      loginFailed: "Login mislykkedes",
      oidcCallbackFailed: "OIDC Callback mislykkedes",
      appRejected: "Applikation afvist",
      appRejectedWithReason: "Applikation afvist: {{reason}}",
      appNotFound: "Applikation ikke fundet",
      accessDenied: "Adgang nægtet",
      tokenExchangeFailed: "Token-udveksling mislykkedes",
      authorize: {
        title: "Brug {{siteName}} til at logge ind på {{appName}}",
        desc: "Denne app anmoder om følgende oplysninger og tilladelser. Efter bekræftelse vil du vende tilbage til forretningsappen for at afslutte login.",
        chooseAccountTitle: "Du er allerede logget ind på {{siteName}}",
        chooseAccountDesc:
          "Vælg om du vil fortsætte med den aktuelle konto eller logge ind med en anden konto først.",
        currentAccountFallback: "Aktuel konto",
        useCurrentAccount: "Fortsæt med denne konto",
        useAnotherAccount: "Log ind med en anden konto",
        permissionTitle: "Anmodede tilladelser",
        permissionCount: "{{count}} elementer",
        agreement:
          "Jeg har læst og accepterer at give de ovenfor anførte tilladelser",
        confirm: "Bekræft og fortsæt",
        cancel: "Annuller og returner til login",
        errors: {
          applicationRejected: "Applikation afvist",
          applicationRejectedWithReason: "Applikation afvist: {{reason}}",
          applicationAccessRestricted: "Adgang til applikation er begrænset",
          applicationAccessBanned: "Adgang til applikation er forbudt",
          applicationAccessBannedWithReason: "Adgang til applikation er forbudt: {{reason}}",
          applicationNotApproved: "Applikation ikke godkendt",
          applicationNotFound: "Applikation ikke fundet",
          forbidden: "Du har ikke tilladelse til at få adgang til denne applikation",
          unsupportedResponseType: "Ikke understøttet responsetype",
          redirectUriMismatch: "Omdirigerings-URI matcher ikke",
          scopeNotAllowed: "Anmodet omfang er ikke tilladt",
          openidScopeRequired: "OpenID-omfang kræves",
          codeChallengeMethodRequiresCodeChallenge:
            "Når code_challenge_method angives, skal også code_challenge angives",
          unsupportedCodeChallengeMethod: "Ikke understøttet code challenge-metode",
          promptNoneMustNotBeCombinedWithOtherValues:
            "Værdien none i prompt kan ikke kombineres med andre værdier",
          invalidMaxAge: "max_age-værdien er ugyldig",
          acrValuesNotSatisfied: "Den aktuelle loginsession opfylder ikke det anmodede autentificeringstekst",
          consentRequired: "Yderligere samtykke kræves",
          loginRequired: "Log venligst ind igen for at fortsætte",
          authorizeFailed: "Godkendelse mislykkedes, prøv venligst igen senere",
          loadAuthorizationSettingsFailed: "Kunne ikke indlæse autoriseringsindstillinger",
          networkRequestFailed: "Netværksanmodning mislykkedes, tjek venligst din forbindelse og prøv igen",
          apiReturnedHtml: "Godkendelsestjenesten returnerede en uventet side. Tjek venligst API eller reverse proxy-konfiguration.",
        },
        scopes: {
          openidTitle: "Bekræft din identitet",
          openidDesc:
            "Bruges til at verificere, at den aktuelle loggede konto tilhører dig, og etablere basissessionslogin.",
          profileTitle: "Få adgang til din offentlige profil",
          profileDesc:
            "Inkluderer dit visningsnavn, avatar og lignende offentlige profildata til visning i appen.",
          emailTitle: "Få adgang til dine e-mailoplysninger",
          emailDesc:
            "Bruges til at vise din kontoe-mail eller understøtte meddelelser og kontobinding, når det er nødvendigt.",
          phoneTitle: "Få adgang til dit telefonnummer",
          phoneDesc:
            "Bruges til kontogenkendelse, meddelelser eller sikkerhedsverifikation, når det er nødvendigt.",
          gatewayReadTitle: "Få adgang til beskyttede forretnings-API'er",
          gatewayReadDesc:
            "Tillader appen at få adgang til beskyttede ressourcer som din autoriserede identitet.",
          customTitle: "Anmoder om tilladelse: {{scope}}",
          customDesc:
            "Denne app anmoder om en ekstra forretningstilladelse. Gennemgå den omhyggeligt, før du fortsætter.",
        },
      },
      sessionConflict: {
        title: "Forskellige konti blev registreret i denne browser",
        desc: "Kontoen husket af dette vindue matcher ikke browserens aktuelt aktive konto. Kun én primær konto kan forblive aktiv i den samme browser ad gangen. Vælg hvilken konto du vil fortsætte med.",
        browserAccount: "Browser aktiv konto",
        thisWindowAccount: "Dette vindues forrige konto",
        useBrowserAccount: "Brug browserens aktive konto",
        useThisWindowAccount: "Skift tilbage til dette vindues konto",
        relogin: "Log ud og log ind igen",
      },
    },
    nav: {
      security: "Login og sikkerhed",
      profile: "Profil",
      privacy: "Privatlivscenter",
      bindings: "Autoriserede apps",
      help: "Hjælpecenter",
    },
    common: {
      loadingFailed: "Kunne ikke indlæse",
      revokeFailed: "Kunne ikke tilbagekalde samtykke",
      revokeSuccess: "Samtykke tilbagekaldt",
      confirm: "Bekræft",
      sendCode: "Send kode",
      sendCodeSuccess: "Bekræftelseskode sendt med succes",
      sendingCode: "Sender",
      save: "Gem",
      saving: "Gemmer",
      edit: "Rediger",
      cancel: "Annuller",
      uploadAvatar: "Upload avatar",
      avatarUpdated: "Avatar opdateret",
      avatarUploadFailed: "Kunne ikke uploade avatar",
      profileUpdated: "Profil opdateret",
      profileUpdateFailed: "Kunne ikke opdatere profil",
      imageReadFailed: "Kunne ikke læse billede",
      imageProcessUnsupported:
        "Billedbehandling understøttes ikke i denne browser",
      avatarConvertFailed: "Kunne ikke konvertere avatar",
      unset: "Ikke indstillet",
      unsetShort: "Ikke indstillet",
      notFilled: "Ikke angivet",
      noRecord: "Ingen poster",
      normal: "Aktiv",
      accountCenter: "Kontocenter",
      noAuthorizedApps: "Ingen autoriserede apps",
    },
    errors: {
      emailRequiredByServer: "Indtast venligst din e-mail",
      passwordRequiredByServer: "Indtast venligst din adgangskode",
      invalidCredentials: "Ugyldig konto eller legitimationsoplysninger",
      invalidOtpCode: "Bekræftelseskoden er ugyldig eller udløbet",
      accountFrozen: "Denne konto er blevet frosset",
      accountFrozenWithReason:
        "Denne konto er blevet frosset. Årsag: {{reason}}",
      userNotFound: "Bruger ikke fundet",
      smsNotConfigured: "SMS-afsendelse er ikke konfigureret",
      smtpNotConfigured: "E-mail-afsendelse er ikke konfigureret",
      userStatusInvalid:
        "Den aktuelle kontostatus tillader ikke denne handling",
      invalidCurrentPhoneVerificationCode:
        "Den aktuelle telefonbekræftelseskode er ugyldig eller udløbet",
      invalidNewPhoneVerificationCode:
        "Den nye telefonbekræftelseskode er ugyldig eller udløbet",
      currentPhoneVerificationCodeRequired:
        "Indtast den aktuelle telefonbekræftelseskode",
      currentPhoneNotBound:
        "Der er i øjeblikket intet telefonnummer bundet til denne konto",
      phoneDoesNotMatchCurrentBoundPhone:
        "Telefonnummeret matcher ikke det aktuelt bundne",
      phoneAlreadyBound: "Dette telefonnummer er allerede bundet",
      newPhoneMustBeDifferent:
        "Det nye telefonnummer skal være forskelligt fra det aktuelle",
      phoneAndVerificationCodeRequired:
        "Indtast telefonnummeret og den nye telefonbekræftelseskode",
      invalidMfaCode: "Tofaktorbekræftelseskoden er ugyldig eller udløbet",
      unsupportedMfaMethod: "Ikke-understøttet tofaktorgodkendelsesmetode",
      mfaNotEnabled:
        "Tofaktorgodkendelse er ikke aktiveret for denne konto",
      emailNotBound: "Der er intet e-mail bundet til denne konto",
      phoneNotBound: "Der er intet telefonnummer bundet til denne konto",
      emailVerificationCodeRequired: "Indtast e-mail-bekræftelseskoden",
      invalidEmailVerificationCode:
        "E-mail-bekræftelseskoden er ugyldig eller udløbet",
      phoneVerificationCodeRequired: "Indtast telefonbekræftelseskoden",
      invalidPhoneVerificationCode:
        "Telefonbekræftelseskoden er ugyldig eller udløbet",
      newPasswordMustBeDifferentFromCurrentPassword:
        "Den nye adgangskode skal være forskellig fra den aktuelle adgangskode",
      phoneBindingChallengeExpired:
        "Telefonbindingssessionen er udløbet. Log venligst ind eller registrer igen.",
      manualMfaCodeNotSendable:
        "Denne konto bruger en manuel MFA-kode og kan ikke sende en kode",
      emailAndPasswordRequired:
        "Indtast din e-mail og adgangskode, før du anmoder om en tofaktorkode",
      mfaChallengeExpiredOrInvalid:
        "Tofaktorbekræftelsessessionen er udløbet. Log venligst ind igen.",
      challengeRequired:
        "Gennemfør sikkerhedsudfordringen, før du anmoder om en kode.",
      captchaRequired:
        "Anmodningsvolumen er højt. Gennemfør sikkerhedskontrollen først.",
      circuitOpen:
        "Leveringskanalen er midlertidigt beskyttet. Prøv venligst igen senere.",
      cooldownActive:
        "Dette mål har anmodet om koder for ofte. Prøv venligst igen senere.",
      passkeyChallengeExpired: "Adgangsnøglesessionen er udløbet. Prøv venligst igen.",
      passkeyVerificationFailed:
        "Adgangsnøglebekræftelse mislykkedes. Prøv igen, eller brug en anden loginmetode.",
      passkeyAlreadyExists: "Denne adgangsnøgle er allerede bundet.",
      passkeyNotFound: "Adgangsnøgle ikke fundet.",
      passkeyBrowserUnsupported:
        "Denne browser eller enhed understøtter ikke adgangsnøgler.",
      passkeyUserHandleInvalid:
        "Kontoen for denne adgangsnøgle kunne ikke identificeres.",
      invalidLoginStepUpVerificationCode:
        "Ekstra bekræftelseskoden er ugyldig eller udløbet.",
      loginStepUpChallengeExpiredOrInvalid:
        "Ekstra bekræftelsessessionen er udløbet. Log venligst ind igen.",
      mfaEnrollmentChallengeExpiredOrInvalid:
        "Tvungen MFA-registreringssession er udløbet. Log venligst ind igen.",
      noAvailableMfaMethodForCurrentAccount:
        "Ingen MFA-metode er tilgængelig for denne konto.",
      noAvailableLoginVerificationTargetForCurrentAccount:
        "Intet ekstra bekræftelsesmål er tilgængeligt for denne konto.",
    },
    security: {
      loginMethods: "Loginmetoder",
      phone: "Bind telefonnummer",
      phoneDesc:
        "Bruges til ekstra loginmetoder, SMS-bekræftelse og kontosikkerhedsmeddelelser",
      bindPhone: "Bind",
      bindPhoneTitle: "Bind telefonnummer",
      bindPhoneHint:
        "Bekræft telefonnummeret først, før du binder. Bekræftelseskoden vil blive sendt til dette telefonnummer.",
      rebindPhoneHint:
        "For at erstatte det bundne telefonnummer skal du først bekræfte det aktuelle telefonnummer og derefter bekræfte det nye.",
      currentPhone: "Aktuelt bundet telefonnummer",
      currentPhoneCode: "Aktuel telefonbekræftelseskode",
      currentPhoneCodePlaceholder:
        "Indtast den 6-cifrede kode sendt til det aktuelle telefonnummer",
      sendCurrentPhoneCode: "Send aktuel telefonkode",
      newPhone: "Telefonnummer",
      newPhoneCode: "Ny telefonbekræftelseskode",
      newPhonePlaceholder: "Indtast et telefonnummer, f.eks. 13800138000",
      smsCode: "SMS-bekræftelseskode",
      smsCodePlaceholder: "Indtast den 6-cifrede SMS-kode",
      safeEmail: "Sikker e-mail",
      safeEmailDesc: "Primære legitimationsoplysninger brugt til login",
      editEmailTitle: "Skift sikker e-mail",
      newEmail: "Ny e-mail",
      newEmailPlaceholder: "Indtast den nye e-mailadresse",
      emailCode: "E-mail-kode",
      emailCodePlaceholder: "Indtast den 6-cifrede kode",
      changeEmailHint:
        "Den nye e-mail skal bekræftes, før ændringen gemmes.",
      changePassword: "Skift adgangskode",
      changePasswordDesc:
        "Opdater din login-adgangskode regelmæssigt for at forbedre kontosikkerheden",
      editPasswordTitle: "Skift login-adgangskode",
      currentPassword: "Aktuel adgangskode",
      currentPasswordPlaceholder: "Indtast din aktuelle adgangskode",
      currentPasswordIncorrect: "Den aktuelle adgangskode er forkert",
      newPassword: "Ny adgangskode",
      newPasswordPlaceholder: "Indtast en ny adgangskode med mindst 8 tegn",
      confirmPassword: "Bekræft ny adgangskode",
      confirmPasswordPlaceholder: "Indtast den nye adgangskode igen",
      changePasswordHint:
        "Brug den nye adgangskode næste gang du logger ind, og undgå at genbruge den gamle.",
      passwordMinLength: "Adgangskode skal være mindst 8 tegn",
      passwordMismatch: "De to nye adgangskoder matcher ikke",
      passwordUpdated: "Adgangskode opdateret",
      passwordUpdateFailed: "Kunne ikke opdatere adgangskode",
      mfa: "Tofaktorgodkendelse",
      mfaDesc: "Når aktiveret, kræves ekstra bekræftelse under login",
      mfaTitle: "Konfigurer tofaktorgodkendelse",
      mfaHint: "Vælg den anden bekræftelsesmetode, der bruges under login.",
      mfaTitleEnable: "Aktiver tofaktorgodkendelse",
      mfaTitleDisable: "Deaktiver tofaktorgodkendelse",
      mfaHintEnable:
        "Vælg den anden bekræftelsesmetode, der bruges under login.",
      mfaHintDisable:
        "Efter deaktivering kræves der ikke længere ekstra bekræftelse under login.",
      mfaMethod: "Bekræftelsesmetode",
      mfaMethodEmail: "E-mail-kode",
      mfaMethodSMS: "Telefonkode",
      passkeys: "Adgangsnøgler",
      passkeysDesc:
        "Efter binding kan du logge ind direkte fra systemets adgangsnøgle-vælger.",
      addPasskey: "Tilføj adgangsnøgle",
      deletePasskey: "Slet adgangsnøgle",
      passkeyName: "Enhedsnavn",
      passkeyNamePlaceholder: "Indtast et genkendeligt navn",
      passkeyLastUsed: "Sidst brugt",
      passkeyLastUsedIP: "Sidst brugte IP",
      passkeyCreatedAt: "Oprettet",
      passkeyEmpty: "Ingen bundne adgangsnøgler",
      passkeyManageVerify:
        "For at beskytte din konto skal du bekræfte dine aktuelle legitimationsoplysninger, før du tilføjer eller sletter en adgangsnøgle.",
      currentMfaCode: "Aktuel MFA-kode",
      currentMfaCodePlaceholder: "Indtast koden fra den aktuelle MFA-metode",
      currentMfaCodeHintEmail:
        "Gennemfør bekræftelse med den aktuelt bundne e-mail-kode, før du gemmer.",
      currentMfaCodeHintSMS:
        "Gennemfør bekræftelse med den aktuelt bundne telefonkode, før du gemmer.",
      currentMfaCodeHintManual:
        "Indtast den aktuelt konfigurerede manuelle MFA-kode, før du gemmer.",
      accountSecurity: "Kontosikkerhed",
      recentLogin: "Seneste login",
      recentLoginDesc: "Sidste vellykkede logintidspunkt og enheds-IP",
    },
    profile: {
      title: "Profil",
      avatar: "Avatar",
      avatarDesc:
        "Billedet vil blive beskåret i midten og konverteret til webp automatisk",
      nickname: "Kaldenavn",
      nicknameDesc: "Aktuelt visningsnavn",
      gender: "Køn",
      genderDesc: "Profilkønsoplysninger for denne konto",
      languagePreference: "Sprogpræference",
      languagePreferenceDesc:
        "Efter login vil dette sprog blive brugt først til sideindhold",
      languagePreferenceSaved: "Sprogpræference gemt",
      languagePreferenceSaveFailed: "Kunne ikke gemme sprogpræference",
      genderMale: "Mand",
      genderFemale: "Kvinde",
      genderOther: "Andet",
      userId: "Bruger-ID",
      userIdDesc: "Unik identifikator for den aktuelle konto i systemet",
      nicknamePlaceholder: "Indtast kaldenavn",
      editNicknameTitle: "Rediger kaldenavn",
      editGenderTitle: "Rediger køn",
      email: "E-mailadresse",
      emailDesc: "Bruges til login, bekræftelse og sikkerhedsmeddelelser",
      createdAt: "Registreret",
      createdAtDesc: "Tidspunktet hvor denne konto blev oprettet",
      country: "Registreringsland",
      countryDesc: "Land eller region registreret ved registrering",
    },
    privacy: {
      title: "Privatlivscenter",
      exportTitle: "Download brugerdata",
      exportDesc:
        "Eksportér profildata og ikke-tilbagekaldte autoriserede apps i CSV-format.",
      exportAction: "Download data",
      exportPasswordVerifyDesc:
        "Bekræft din aktuelle login-adgangskode, før du downloader. CSV vil indeholde profildata og ikke-tilbagekaldte autoriserede apps.",
      exportSuccess: "Download af brugerdata startet",
      exportFailed: "Kunne ikke eksportere brugerdata",
      minimizeTitle: "Dataminimering",
      minimizeDesc:
        "Systemet gemmer kun registreringsland, e-mail, samtykker og essentielle login-sikkerhedsdata.",
      scopeTitle: "Aktuelt adgangsomfang",
      scopeDesc:
        "Du kan gennemse apps, der har fået adgang til din konto i Autoriserede apps og tilbagekalde dem når som helst.",
      statusTitle: "Kontostatus",
      statusDesc:
        "Hvis kontoen er frosset, vil login blive blokeret, indtil en administrator løser det.",
      deleteTitle: "Slet konto",
      deleteDesc:
        "Hvis du logger ind igen inden for 7 dage, annulleres sletningsanmodningen automatisk. Ellers vil kontoen og samtykkedata blive fjernet.",
      deleteWarningPrimary:
        "Sletning af kontoen er irreversibel. Sikkerhedskopier venligst alle data relateret til denne konto først.",
      deleteWarningSecondary:
        "Efter anmodningen er indsendt, vil login igen inden for 7 dage annullere sletningen. Hvis du ikke logger ind inden for 7 dage, sletter systemet automatisk kontoen og samtykkedata.",
      deleteAction: "Jeg har læst og accepterer konsekvenserne",
      passwordVerifyTitle: "Bekræft aktuel adgangskode",
      passwordVerifyDesc:
        "Indtast din aktuelle login-adgangskode, og gennemfør e-mail-bekræftelse. Hvis et telefonnummer er bundet, kræves der også telefonbekræftelse.",
      emailVerifyCode: "E-mail-bekræftelseskode",
      emailVerifyCodePlaceholder: "Indtast den 6-cifrede kode sendt til din e-mail",
      sendDeleteEmailCode: "Send e-mail-kode",
      sendDeleteEmailCodeSuccess:
        "E-mail-bekræftelseskoden er blevet sendt. Tjek venligst din indbakke.",
      sendDeleteEmailCodeFailed: "Kunne ikke sende e-mail-bekræftelseskode",
      phoneVerifyCode: "Telefonbekræftelseskode",
      phoneVerifyCodePlaceholder: "Indtast den 6-cifrede kode sendt til din telefon",
      sendDeletePhoneCode: "Send telefonkode",
      sendDeletePhoneCodeSuccess:
        "Telefonbekræftelseskoden er blevet sendt. Tjek venligst din telefon.",
      sendDeletePhoneCodeFailed: "Kunne ikke sende telefonbekræftelseskode",
      confirmDeleteNow: "Indsend sletningsanmodning",
      deleteSuccess:
        "Sletningsanmodning indsendt. Login inden for 7 dage vil annullere den.",
      deleteFailed: "Kunne ikke indsende sletningsanmodning",
      deletePendingAt:
        "Sletningsanmodning indsendt. Planlagt sletningstidspunkt: {{date}}",
    },
    bindings: {
      title: "Autoriserede apps",
      appId: "App-navn",
      scopes: "Omfang",
      createdAt: "Autoriseret",
      authorizedAt: "Autoriseret",
      status: "Status",
      action: "Handling",
      viewDetails: "Detaljer",
      detailTitle: "Autoriseringsdetaljer",
      siteName: "Autoriseret websted",
      requestedPermissions: "Givne tilladelser",
      accessStatus: "Adgangsstatus",
      reason: "Årsag",
      effectiveAt: "Ikrafttrædelsesdato",
      expiresAt: "Udløbsdato",
      accessStatusNormal: "Aktiv",
      accessStatusRestricted: "Begrænset",
      accessStatusBanned: "Blokeret",
      scopeOpenIdTitle: "Bekræft din identitet",
      scopeOpenIdDesc:
        "Bruges til at bekræfte, at den loggede konto virkelig er dig og etablere basissessionslogin.",
      scopeProfileTitle: "Få adgang til din offentlige profil",
      scopeProfileDesc:
        "Inkluderer kaldenavn, avatar og andre offentlige profildata til visning i appen.",
      scopeEmailTitle: "Få adgang til din e-mailadresse",
      scopeEmailDesc:
        "Bruges til at vise din kontoe-mail eller sende meddelelser og binde din konto, når det er nødvendigt.",
      scopePhoneTitle: "Få adgang til dit telefonnummer",
      scopePhoneDesc:
        "Bruges til kontogenkendelse, meddelelser eller sikkerhedsverifikation, når det er nødvendigt.",
      scopeGatewayReadTitle: "Få adgang til beskyttede forretnings-API'er",
      scopeGatewayReadDesc:
        "Tillader appen at få adgang til beskyttede API-ressourcer på dine vegne efter autorisation.",
      scopeCustomTitle: "Anmodet tilladelse: {{scope}}",
      scopeCustomDesc:
        "Denne app anmoder om en ekstra forretningstilladelse. Gennemgå den omhyggeligt, før du fortsætter.",
      revoke: "Tilbagekald",
      batchRevoke: "Batch-tilbagekald",
      batchRevokeConfirmTitle: "Bekræft batch-tilbagekald?",
      batchRevokeConfirmDesc:
        "{{count}} autorisationer er valgt. Disse apps skal anmode om samtykke igen.",
    },
    help: {
      title: "Hjælpecenter",
      loginIssueTitle: "Kan ikke logge ind",
      loginIssueDesc:
        "Hvis du ikke kan logge ind, skal du først bekræfte, at du bruger den korrekte metode til kontoen, såsom adgangskode, e-mail-kode, telefonkode eller adgangsnøgle. Hvis en bekræftelseskode afvises, skal du sikre dig, at det er den nyeste og stadig inden for dens gyldighedsperiode. Hvis kontoen vises som frossen, afventer aktivering eller på anden måde begrænset, skal problemet håndteres af en platformadministrator. Hvis du for nylig har indsendt en kontosletningsanmodning, kan systemet også kræve sletningsbekræftelse eller telefonbinding, før adgangen gendannes.",
      protectTitle: "Beskyt din konto",
      protectDesc:
        "Aktiver tofaktorgodkendelse så hurtigt som muligt, og bind adgangsnøgler på betroede enheder for at reducere risikoen for kun adgangskode-kompromittering. Del aldrig e-mail-koder, SMS-koder eller MFA-koder med tredjeparter, og indtast ikke legitimationsoplysninger igen på sider, du ikke stoler på. Hvis du bruger den samme konto på flere enheder, skal du regelmæssigt gennemgå seneste logins, bundne adgangsnøgler og autoriserede apps og fjerne enheder eller autorisationer, du ikke længere bruger.",
      authIssueTitle: "Autoriseringsproblemer",
      authIssueDesc:
        "Hvis en app ser ukendt ud, anmoder om usædvanlige omfang, eller du mistænker, at den misbruger din konto, skal du åbne Autoriserede apps for at gennemgå dens autorisationstid, givne omfang og integrationsdetaljer og straks tilbagekalde den, hvis det er nødvendigt. Efter tilbagekaldelse vil appen ikke længere kunne få adgang til beskyttede ressourcer med din konto, før du logger ind igen og godkender en ny samtykkeanmodning. Hvis problemet kan påvirke hele kontoen snarere end en enkelt app, bør du også ændre din adgangskode, verificere dine MFA-indstillinger og gennemgå seneste logins og adgangsnøgleaktivitet.",
      contactTitle: "Kontakt os",
      contactDesc:
        "Hvis du har brug for manuel assistance, kan du kontakte platformsupportkontakten nedenfor. Når du rapporterer et problem, skal du inkludere kontoe-mailen, tidspunktet hvor problemet opstod, skærmbilleder af fejlmeddelelser, den loginmetode du brugte, og relevante enheds- eller browserdetaljer, så problemet kan undersøges hurtigere.",
      contactMainlandTitle: "Fastlandskina",
      contactOverseasTitle: "Udlandet",
      contactPersonLabel: "Kontaktperson:",
      contactPhoneLabel: "Telefon:",
      contactEmailLabel: "E-mail:",
      contactHoursLabel: "Supporttimer:",
      contactMainlandPersonValue: "YOUR_NAME",
      contactMainlandPhoneValue: "YOUR_PHONE_NUMBER",
      contactMainlandEmailValue: "YOUR_EMAIL",
      contactMainlandHoursValue: "Mandag til fredag 09:00 - 18:00",
      contactOverseasPersonValue: "Tilføjes senere",
      contactOverseasPhoneValue: "Tilføjes senere",
      contactOverseasEmailValue: "Tilføjes senere",
      contactOverseasHoursValue: "Mandag til fredag 09:00 - 18:00",
      contactRegionNotice:
        "Kontakt venligst supportkanalen for din region først. Hvis du er usikker på, hvilken region der gælder, skal du starte med fastlandskina-kontakten for hjælp til viderestilling.",
      contactNotice:
        "For problemer såsom frosne konti, unormale autorisationer, mistede adgangsnøgler eller gendannelse af sletning, skal du kontakte administratoren via ovenstående telefonnummer eller e-mail først. Hvis din platform leverer et officielt ticketsystem, opslagstavle eller driftsgruppe, skal du følge den officielle kanal først.",
    },
  },
} as const;

export default locale;
