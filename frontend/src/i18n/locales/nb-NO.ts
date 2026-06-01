const locale = {
  translation: {
    header: {
      language: "Endre språk",
      languageModalTitle: "Velg språk",
      languageModalDesc: "Velg hvilket grensesnittspråk du vil bruke.",
      agreement: "Brukeravtale",
      privacy: "Personvernpolicy",
      help: "Hjelpesenter",
      logout: "Logg ut",
      accountCenter: "Konto senter",
    },
    legal: {
      back: "Tilbake til hjemmeside",
      updatedAt: "Sist oppdatert: {{date}}",
      agreement: {
        title: "Brukeravtale",
        updatedAt: "2026-03-16",
        intro:
          "Velkommen til {{siteName}}. Før du registrerer deg, logger inn, integrerer eller bruker de enhetlige autentiseringsfunksjonene, bør du lese denne avtalen nøye. Ved å fortsette å bruke tjenesten, godtar du å være bundet av denne avtalen.",
        sections: {
          accountTitle: "1. Konto og pålogging",
          accountP1:
            "Du må oppgi ekte, lovlig og kontaktbar registreringsinformasjon og ivareta kontoen, passordet, verifiseringskoder og andre legitimasjonsskjemaer dine. Du er ansvarlig for tap forårsaket av dårlig administrering av legitimasjon på din side.",
          accountP2:
            "Hvis uvanlig påloggingsaktivitet, regelbrudd, frossen status eller sikkerhetsrisikoer oppdages, kan plattformen kreve ytterligere verifisering, begrense påloggingen eller suspendere tilgang for sikkerhetsgrunner.",
          acceptableUseTitle: "2. Akseptabel bruk",
          acceptableUseP1:
            "Du må ikke bruke dette systemet for noen ulovlig aktivitet, rettskrenkelse, misbruk av autentiseringsgrensesnitt, masseforespørsler, legitimasjonsfylling eller noen oppførsel som truer plattformens stabilitet eller omgår sikkerhetsteknologi.",
          acceptableUseP2:
            "Hvis du brer denne avtalen eller relaterte regler, kan plattformen suspendere eller avslutte deler av eller hele tilgangen din og beholder retten til å etterfølge ansvar når det er nødvendig.",
          authorizationTitle: "3. Autorisasjon og tredjepartapplikasjoner",
          authorizationP1:
            "Når du bruker en {{siteName}}-konto til å logge inn på en tredjepartapplikasjon, vil systemet be om ditt samtykke basert på tillatelsene som vises på autorisasjons siden. Du kan avvise eller tilbakekalle det samtykket når som helst i konto senteret.",
          authorizationP2:
            "Enhver bruk av dine data av en tredjepartapplikasjon etter autorisasjon reguleres av applikasjonens egne servicebetingelser og personvernpolicy. Plattformen tar kun ansvar i det omfang som kreves av lovgivningen.",
          developerTitle: "4. Utviklerintegrasjon",
          developerP1:
            "Utviklere må sikre at applikasjonsinformasjon, omdirigerings-URI-er, forespurte omfang og forretningsformål er sanne, komplette og kontinuerlig gyldige, og må ikke mislede brukere.",
          developerP2:
            "Plattformen kan gjennomgå, avvise, fjerne fra listen, slette eller begrense tilkoblede applikasjoner for å opprettholde sikkerheten og integriteten i det enhetlige identitetsekosystemet.",
          liabilityTitle: "5. Tjenestendringer og begrensning av ansvar",
          liabilityP1:
            "Av sikkerhets-, overholdelses-, operasjons- eller vedlikeholdsårsaker kan plattformen justere, oppgradere, suspendere eller avslutte visse grensesnitt, flyter eller funksjoner, og vil prøve å gi varsel når det er passende.",
          liabilityP2:
            "I det omfang lovgivningen tillater, er plattformen ikke ansvarlig utover loverlige forpliktelser for avbrudd, unormal data eller tap forårsaket av overmakt, nettverksfeil, tredjepartsgrunner eller uegnet bruk på din side.",
        },
      },
      privacy: {
        title: "Personvernpolicy",
        updatedAt: "2026-03-16",
        intro:
          "{{siteName}} verdsetter din personlige informasjon og konto sikkerhet. Denne policyen forklarer hvordan vi samler inn, bruker, lagrer, deler og beskytter informasjonen din, samt hvilke rettigheter du har tilgjengelig.",
        sections: {
          dataCollectionTitle: "1. Informasjon vi samler inn",
          dataCollectionP1:
            "Når du registrerer deg, logger inn eller bruker kontotjenester, kan vi samle inn din registreringsland, e-postadresse, telefonnummer, passordhash, påloggingsøkter, enhets-IP, autorisasjonsregistreringer og nødvendige sikkerhetslogger.",
          dataCollectionP2:
            "Når du laster opp et avatar, endrer profil, binder et telefonnummer, aktiverer MFA eller autoriserer en tredjepartapplikasjon, behandler vi den informasjonen du sender inn som trengs for å levere den funksjonen.",
          dataUsageTitle: "2.Hvordan vi bruker informasjon",
          dataUsageP1:
            "Vi bruker relevant informasjon til å tilby konto registrasjon, påloggingsautentisering, verifiseringskodesending, risikokontroll, autorisasjonsbekreftelse, utviklerapplikasjons gjennomgang, konto sikkerhetsvarsler og tjenestetilgjengelighetsvedlikehold.",
          dataUsageP2:
            "Vi analyserer også logger og statistikk på en minimal-nødvendig basis for å oppdage unormal aktivitet, forbedre produktet opplevelse og styrke sikkerheten.",
          dataSharingTitle: "3. Deling og avsløring",
          dataSharingP1:
            "Vi gir bare identitetsinformasjon eller tillatelsesrelatert data til tredjepartapplikasjoner når du eksplisitt autoriserer omfangene som vises på autorisasjons siden.",
          dataSharingP2:
            "Bortsett fra hvor lovgivningen krever det, regulatoriske forespørsler, offentlig interesseskydd eller system sikkerhetsbehov, selger vi ikke eller deler ulovlig din personlige informasjon med urelaterte tredjeparter.",
          userRightsTitle: "4. Dine rettigheter",
          userRightsP1:
            "Du kan gjennomse og oppdatere din profil, bindinger, autorisasjonsregistreringer og sikkerhetsinnstillinger i konto senteret, og du kan tilbakekalle applikasjons tillatelser eller sende en konto sletteforespørsel.",
          userRightsP2:
            "Hvis du mener informasjonen din er uakkurat, behandlet feilaktig eller brukt utover det nødvendige, kan du kontakte plattformoperatøren eller utøve dine rettigheter under gjeldende lovgivning.",
          securityTitle: "5. Beskyttelse og oppbevaring",
          securityP1:
            "Vi bruker tilgangskontroller, passord hashing, verifiseringskode utløp, auditlogger og dataminimering tiltak for å beskytte din personlige informasjon og autentiseringsdata.",
          securityP2:
            "Underlagt lovlige og forretningskrav, oppbevarer vi informasjonen din bare så lenge som nødvendig for å oppfylle tjenestemål; etter konto sletting eller utløp av oppbevaringsperioder, vil vi slette eller anonymisere dataene i henhold til policyen.",
        },
      },
    },
    auth: {
      noAccount: "Ingen konto?",
      registerNow: "Registrer deg nå",
      registerPageTitle: "Opprett konto",
      registerPageSubtitle:
        "Fullfør registreringen med ditt land, e-post og e-postverifiseringskode.",
      registerDisabled: "Registrering er for øyeblikket deaktivert",
      registerSuccess:
        "Registrering vellykket. Vennligst logg inn med passordet ditt.",
      phoneBindingRequiredAfterRegister:
        "Registrering lyktes. Vennligst bind ditt telefonnummer for å aktivere kontoen først.",
      registerFailed: "Registrering feilet",
      country: "Land",
      countryRequired: "Velg et land",
      registerCode: "E-postkode",
      registerCodeRequired: "Skriv inn e-postverifiseringskoden",
      registerCodePlaceholder: "Skriv inn 6-sifrede koden",
      sendRegisterCode: "Send kode",
      sendRegisterCodeSuccess:
        "Verifiseringskoden har blitt sendt. Vennligst sjekk innboksen din.",
      sendRegisterCodeFailed: "Kunne ikke sende verifiseringskode",
      backToLoginWithAccount: "Har du allerede en konto? Logg inn",
      forgotPassword: "Glemt passord?",
      forgotPasswordPageTitle: "Tilbakestill passord",
      forgotPasswordPageSubtitle:
        "Tilbakestill ditt påloggings passord med din registrerte e-post og verifiseringskode.",
      forgotPasswordPrompt: "Glemt passordet ditt?",
      forgotPasswordAction: "Hent det tilbake",
      forgotPasswordDesc:
        "Etter å ha verifisert e-posten din med en kode, kan du sette et nytt påloggings passord direkte.",
      forgotPasswordHint:
        "Skriv inn din registrerte e-post, verifiseringskoden og et nytt passord. Du kan logge inn med det nye passordet med en gang etter innsendelse.",
      goToOtpLogin: "Bruk e-postkode pålogging",
      resetCode: "Gjenopprettingskode",
      sendResetCode: "Send gjenopprettingskode",
      sendResetCodeSuccess:
        "Gjenopprettingskoden har blitt sendt. Vennligst sjekk innboksen din.",
      sendResetCodeFailed: "Kunne ikke sende gjenopprettingskode",
      resetPassword: "Tilbakestill passord",
      resetPasswordSuccess:
        "Passord tilbakestilt vellykket. Vennligst logg inn med ditt nye passord.",
      resetPasswordFailed: "Kunne ikke tilbakestille passord",
      newPassword: "Nytt passord",
      confirmNewPassword: "Bekreft nytt passord",
      newPasswordPlaceholder: "Skriv inn et passord med minst 8 tegn",
      confirmPassword: "Bekreft passord",
      confirmPasswordPlaceholder: "Skriv inn passordet igjen",
      backToLogin: "Tilbake til pålogging",
      emailRequired: "Skriv inn e-posten din",
      passwordRequired: "Skriv inn passordet ditt",
      otpCodeRequired: "Skriv inn e-postverifiseringskoden",
      phoneRequired: "Skriv inn telefonnummeret ditt",
      phoneOtpCodeRequired: "Skriv inn SMS-verifiseringskoden",
      emailInvalid: "Skriv inn en gyldig e-postadresse",
      resetCodeRequired: "Skriv inn gjenopprettingskoden",
      resetCodePlaceholder: "Skriv inn 6-sifrede gjenopprettingskoden",
      newPasswordRequired: "Skriv inn et nytt passord",
      confirmNewPasswordRequired: "Bekreft det nye passordet igjen",
      newPasswordMinLength: "Nytt passord må være minst 8 tegn",
      passwordMinLength: "Passordet må være minst 8 tegn",
      newPasswordMismatch: "De to nye passordene samsvarer ikke",
      passwordMismatch: "De to passordene samsvarer ikke",
      registrationClosed: "Registrering er for øyeblikket stengt",
      login: "Logg inn",
      passkeyLogin: "Passordnøkkel",
      passkeyLoginDesc:
        "Bruk en passordnøkkel som allerede er bundet til denne siden på enheten din eller systemkontoen din.",
      passkeyLoginButton: "Bruk passordnøkkel",
      passkeyLoginHint:
        "Du må binde en passordnøkkel i konto senteret før du bruker den her.",
      passkeyLoginSuccess: "Passordnøkkel lagt til vellykket",
      passkeyNotAvailable:
        "Ingen passordnøkkel for denne siden er tilgjengelig på denne enheten. Bruk en annen påloggingsmetode.",
      passwordLogin: "Passord",
      otpLogin: "E-postkode",
      phoneOtpLogin: "Telefonkode",
      email: "E-post",
      phone: "Telefonnummer",
      password: "Passord",
      otpCode: "E-postkode",
      phoneOtpCode: "SMS-kode",
      mfaCode: "2FA-kode",
      mfaPlaceholder: "La stå tomt hvis tofaktorautentisering ikke er aktivert",
      sendOtpCode: "Send e-postkode",
      sendOtpCodeSuccess:
        "E-postkoden har blitt sendt. Vennligst sjekk innboksen din.",
      sendOtpCodeFailed: "Kunne ikke sende verifiseringskode",
      sendOtpCodeEmailRequired: "Skriv inn e-posten din før du ber om en kode",
      sendPhoneOtpCode: "Send SMS-kode",
      sendPhoneOtpCodeSuccess:
        "SMS-koden har blitt sendt. Vennligst sjekk telefonen din.",
      sendPhoneOtpCodeFailed: "Kunne ikke sende SMS-kode",
      sendPhoneBindingCode: "Send bindingskode",
      sendPhoneBindingCodeSuccess:
        "Telefonbindingskoden har blitt sendt. Vennligst sjekk telefonen din.",
      sendPhoneBindingCodeFailed: "Kunne ikke sende telefonbindingskoden",
      securityCaptcha: "Sikkerhetskontroll",
      securityCaptchaPlaceholder:
        "Skriv inn sikkerhetskontrollverdien og prøv igjen",
      securityCaptchaHelp:
        "Når gjeldende enhet eller IP sender forespørsler for ofte, fullfør denne sikkerhetskontrollen før du ber om en annen kode.",
      securityCaptchaRequiredTip:
        "Forespørselsvolumet er høyt. Fullfør sikkerhetskontrollen før du ber om en annen kode.",
      sendOtpCodePhoneRequired:
        "Skriv inn telefonnummeret ditt før du ber om en kode",
      phoneBindingPageTitle: "Bind telefonnummer",
      phoneBindingRegisterDesc:
        "Denne kontoen traff post-registrering risikoregelen. Bind et telefonnummer før du fortsetter.",
      phoneBindingLoginDesc:
        "Denne kontoen traff påloggingsrisikoregelen. Bind et telefonnummer før du fortsetter.",
      completePhoneBinding: "Bind og fortsett",
      phoneBindingSuccess:
        "Telefonnummer bundet vellykket. Kontoen er aktiv igjen.",
      mfaVerifyTitle: "Tofaktorverifisering",
      mfaVerifyEmailHint:
        "En verifiseringskode ble sendt til {{target}}. Skriv den inn for å fortsette å logge inn.",
      mfaVerifyPhoneHint:
        "En verifiseringskode ble sendt til {{target}}. Skriv den inn for å fortsette å logge inn.",
      loginStepUpTitle: "Ekstra påloggingsverifisering",
      loginStepUpEmailDesc:
        "Denne påloggingen krever en ekstra e-postverifisering. En kode vil bli sendt til {{email}}.",
      loginStepUpSMSDesc:
        "Denne påloggingen krever en ekstra telefonverifisering. En kode vil bli sendt til {{phone}}.",
      loginStepUpDualDesc:
        "Denne påloggingen krever både e-post- og telefonverifisering. E-post: {{email}}, telefon: {{phone}}.",
      loginStepUpExpired:
        "Den ekstra påloggingsverifiseringsøkten utløp. Vennligst logg inn igjen.",
      forcedMfaEnrollmentTitle: "Tofaktorautentisering må være aktivert",
      forcedMfaEnrollmentDesc:
        "En administrator krever at denne kontoen aktiverer tofaktorautentisering før denne påloggingen kan fullføres.",
      forcedMfaEnrollmentExpired:
        "Den tvungne MFA-registreringsoekten utløp. Vennligst logg inn igjen.",
      completeForcedMfaEnrollment: "Aktiver og fortsett",
      cancelForcedMfaEnrollment: "Avbryt og gå tilbake til pålogging",
      verifyAndLogin: "Verifiser og logg inn",
      deletionConfirmTitle: "Konto sletteforespørsel sendt",
      deletionConfirmScheduledAt: "Planlagt slettingstid: {{date}}",
      deletionConfirmDesc:
        "Logging inn igjen vil avbryte slettingen.",
      deletionConfirmContinue: "Fortsett og avbryt sletting",
      deletionConfirmExpired: "Bekreftelse utløp, vennligst logg inn igjen",
      deletionConfirmFailed: "Bekreftelse feilet, vennligst logg inn igjen",
      logoutProgressTitle: "Logger ut",
      logoutProgressDesc:
        "Identitetsøkten har blitt tømt og tilkoblede applikasjoner logger ut.",
      loginFailed: "Pålogging feilet",
      oidcCallbackFailed: "OIDC callback feilet",
      appRejected: "Applikasjon avvist",
      appRejectedWithReason: "Applikasjon avvist: {{reason}}",
      appNotFound: "Applikasjon ikke funnet",
      accessDenied: "Tilgang nektet",
      tokenExchangeFailed: "Tokenutveksling feilet",
      authorize: {
        title: "Bruk {{siteName}} for å logge inn på {{appName}}",
        desc: "Denne applikasjonen ber om følgende informasjon og tillatelser. Etter bekreftelse vil du returnere til forretningsapplikasjonen for å fullføre påloggingen.",
        chooseAccountTitle: "Du er allerede logget inn på {{siteName}}",
        chooseAccountDesc:
          "Velg om du vil fortsette med den gjeldende kontoen eller logge inn med en annen konto først.",
        currentAccountFallback: "Gjeldende konto",
        useCurrentAccount: "Fortsett med denne kontoen",
        useAnotherAccount: "Logg inn med en annen konto",
        permissionTitle: "Forespurte tillatelser",
        permissionCount: "{{count}} elementer",
        agreement:
          "Jeg har lest og godtar å gi tillatelsene som er oppført ovenfor",
        confirm: "Bekreft og fortsett",
        cancel: "Avbryt og gå tilbake til pålogging",
        errors: {
          applicationRejected: "Applikasjon avvist",
          applicationRejectedWithReason: "Applikasjon avvist: {{reason}}",
          applicationAccessRestricted: "Tilgang til applikasjon begrenset",
          applicationAccessBanned: "Tilgang til applikasjon forbudt",
          applicationAccessBannedWithReason: "Tilgang til applikasjon forbudt: {{reason}}",
          applicationNotApproved: "Applikasjon ikke godkjent",
          applicationNotFound: "Applikasjon ikke funnet",
          forbidden: "Du har ikke tillatelse til å få tilgang til denne applikasjonen",
          unsupportedResponseType: "Ikke støttet responsetype",
          redirectUriMismatch: "Omdirigerings-URI matcher ikke",
          scopeNotAllowed: "Forespurte omfang ikke tillatt",
          openidScopeRequired: "OpenID-omfang kreves",
          codeChallengeMethodRequiresCodeChallenge:
            "Når code_challenge_method angis, må også code_challenge angis",
          unsupportedCodeChallengeMethod: "Ikke støttet code challenge-metode",
          promptNoneMustNotBeCombinedWithOtherValues:
            "Verdien 'none' i prompt kan ikke kombineres med andre verdier",
          invalidMaxAge: "max_age-verdien er ugyldig",
          acrValuesNotSatisfied: "Den gjeldende påloggingsøkten oppfyller ikke den forespurte autentiseringskonteksten",
          consentRequired: "Ytterligere samtykke kreves",
          loginRequired: "Vennligst logg inn igjen for å fortsette",
          authorizeFailed: "Autorisasjon mislyktes, vennligst prøv igjen senere",
          loadAuthorizationSettingsFailed: "Kunne ikke laste autoriseringsinnstillinger",
          networkRequestFailed: "Nettverksforespørsel mislyktes, vennligst sjekk din tilkobling og prøv igjen",
          apiReturnedHtml: "Autorisasjonstjenesten returnerte en uventet side. Vennligst sjekk API- eller reverse proxy-konfigurasjonen.",
        },
        scopes: {
          openidTitle: "Bekreft din identitet",
          openidDesc:
            "Brukes for å verifisere at den gjeldende innloggede kontoen tilhører deg og etablere den grunnleggende påloggingsøkten.",
          profileTitle: "Tilgang til din offentlige profil",
          profileDesc:
            "Inkluderer ditt visningsnavn, avatar og lignende offentlig profil data for innholdspresentasjon.",
          emailTitle: "Tilgang til din e-postinformasjon",
          emailDesc:
            "Brukes for å vise din konto e-post eller støtte varsler og konto kobling når det er nødvendig.",
          phoneTitle: "Tilgang til ditt telefonnummer",
          phoneDesc:
            "Brukes for konto gjenkjennelse, varsler eller sikkerhetsverifisering når det er nødvendig.",
          gatewayReadTitle: "Tilgang til beskyttede forretnings API-er",
          gatewayReadDesc:
            "Tillater applikasjonen å få tilgang til beskyttede ressurser som din autoriserte identitet.",
          customTitle: "Ber om tillatelse: {{scope}}",
          customDesc:
            "Denne applikasjonen ber om en ekstra forretningstillatelse. Gjenomse den nøye før du fortsetter.",
        },
      },
      sessionConflict: {
        title: "Ulike konti ble oppdaget i denne nettleseren",
        desc: "Kontoen som er husket av dette vinduet samsvarer ikke med nettleserens for øyeblikket aktive konto. Bare én primær konto kan forbli aktiv i samme nettleser på en gang. Velg hvilken konto du vil fortsette med.",
        browserAccount: "Nettleserens aktive konto",
        thisWindowAccount: "Dette vinduets tidligere konto",
        useBrowserAccount: "Bruk nettleserens aktive konto",
        useThisWindowAccount: "Bytt tilbake til dette vinduets konto",
        relogin: "Logg ut og logg inn igjen",
      },
    },
    nav: {
      security: "Pålogging og sikkerhet",
      profile: "Profil",
      privacy: "Personvern senter",
      bindings: "Autoriserte applikasjoner",
      help: "Hjelpesenter",
    },
    common: {
      loadingFailed: "Kunne ikke laste",
      revokeFailed: "Kunne ikke tilbakekalle samtykke",
      revokeSuccess: "Samtykke tilbakekalt",
      confirm: "Bekreft",
      sendCode: "Send kode",
      sendCodeSuccess: "Verifiseringskode sendt vellykket",
      sendingCode: "Sender",
      save: "Lagre",
      saving: "Lagrer",
      edit: "Endre",
      cancel: "Avbryt",
      uploadAvatar: "Last opp avatar",
      avatarUpdated: "Avatar oppdatert",
      avatarUploadFailed: "Kunne ikke laste opp avatar",
      profileUpdated: "Profil oppdatert",
      profileUpdateFailed: "Kunne ikke oppdatere profil",
      imageReadFailed: "Kunne ikke lese bilde",
      imageProcessUnsupported:
        "Bildebehandling støttes ikke i denne nettleseren",
      avatarConvertFailed: "Kunne ikke konvertere avatar",
      unset: "Ikke satt",
      unsetShort: "Ikke satt",
      notFilled: "Ikke gitt",
      noRecord: "Ingen poster",
      normal: "Aktiv",
      accountCenter: "Konto senter",
      noAuthorizedApps: "Ingen autoriserte applikasjoner",
    },
    errors: {
      emailRequiredByServer: "Vennligst skriv inn e-posten din",
      passwordRequiredByServer: "Vennligst skriv inn passordet ditt",
      invalidCredentials: "Ugyldig konto eller legitimasjon",
      invalidOtpCode: "Verifiseringskoden er ugyldig eller utløpt",
      accountFrozen: "Denne kontoen har blitt frosset",
      accountFrozenWithReason:
        "Denne kontoen har blitt frosset. Grunn: {{reason}}",
      userNotFound: "Bruker ikke funnet",
      smsNotConfigured: "SMS sending er ikke konfigurert",
      smtpNotConfigured: "E-post sending er ikke konfigurert",
      userStatusInvalid:
        "Den gjeldende konto status tillater ikke denne handlingen",
      invalidCurrentPhoneVerificationCode:
        "Den gjeldende telefonverifiseringskoden er ugyldig eller utløpt",
      invalidNewPhoneVerificationCode:
        "Den nye telefonverifiseringskoden er ugyldig eller utløpt",
      currentPhoneVerificationCodeRequired:
        "Skriv inn den gjeldende telefonverifiseringskoden",
      currentPhoneNotBound:
        "Inget telefonnummer er for øyeblikket bundet til denne kontoen",
      phoneDoesNotMatchCurrentBoundPhone:
        "Telefonnummeret samsvarer ikke med det for øyeblikket bundede",
      phoneAlreadyBound: "Dette telefonnummeret er allerede bundet",
      newPhoneMustBeDifferent:
        "Det nye telefonnummeret må være forskjellig fra det gjeldende",
      phoneAndVerificationCodeRequired:
        "Skriv inn telefonnummeret og den nye telefonverifiseringskoden",
      invalidMfaCode: "Tofaktorverifiseringskoden er ugyldig eller utløpt",
      unsupportedMfaMethod: "Usupported tofaktorautentiseringsmetode",
      mfaNotEnabled:
        "Tofaktorautentisering er ikke aktivert for denne kontoen",
      emailNotBound: "Ingen e-post er bundet til denne kontoen",
      phoneNotBound: "Inget telefonnummer er bundet til denne kontoen",
      emailVerificationCodeRequired: "Skriv inn e-postverifiseringskoden",
      invalidEmailVerificationCode:
        "E-postverifiseringskoden er ugyldig eller utløpt",
      phoneVerificationCodeRequired: "Skriv inn telefonverifiseringskoden",
      invalidPhoneVerificationCode:
        "Telefonverifiseringskoden er ugyldig eller utløpt",
      newPasswordMustBeDifferentFromCurrentPassword:
        "Det nye passordet må være forskjellig fra det gjeldende passordet",
      phoneBindingChallengeExpired:
        "Telefonbindingsøkten utløp. Vennligst logg inn eller registrer deg igjen.",
      manualMfaCodeNotSendable:
        "Denne kontoen bruker en manuell MFA-kode og kan ikke sende en kode",
      emailAndPasswordRequired:
        "Skriv inn e-posten og passordet ditt før du ber om en tofaktorkode",
      mfaChallengeExpiredOrInvalid:
        "Tofaktorverifiseringsøkten utløp. Vennligst logg inn igjen.",
      challengeRequired:
        "Fullfør sikkerhetsutfordringen før du ber om en kode.",
      captchaRequired:
        "Forespørselsvolumet er høyt. Fullfør sikkerhetskontrollen først.",
      circuitOpen:
        "Leveringskanalen er midlertidig beskyttet. Vennligst prøv igjen senere.",
      cooldownActive:
        "Dette målet har bedt om koder for ofte. Vennligst prøv igjen senere.",
      passkeyChallengeExpired: "Passordnøkkel økten utløp. Vennligst prøv igjen.",
      passkeyVerificationFailed:
        "Passordnøkkel verifisering feilet. Prøv igjen eller bruk en annen påloggingsmetode.",
      passkeyAlreadyExists: "Denne passordnøkkelen er allerede bundet.",
      passkeyNotFound: "Passordnøkkel ikke funnet.",
      passkeyBrowserUnsupported:
        "Denne nettleseren eller enheten støtter ikke passordnøkler.",
      passkeyUserHandleInvalid:
        "Kontoen for denne passordnøkkelen kunne ikke identifiseres.",
      invalidLoginStepUpVerificationCode:
        "Den ekstra verifiseringskoden er ugyldig eller utløpt.",
      loginStepUpChallengeExpiredOrInvalid:
        "Den ekstra verifiseringsøkten utløp. Vennligst logg inn igjen.",
      mfaEnrollmentChallengeExpiredOrInvalid:
        "Den tvungne MFA-registreringsoekten utløp. Vennligst logg inn igjen.",
      noAvailableMfaMethodForCurrentAccount:
        "Ingen MFA-metode er tilgjengelig for denne kontoen.",
      noAvailableLoginVerificationTargetForCurrentAccount:
        "Ingen ekstra verifisering mål er tilgjengelig for denne kontoen.",
    },
    security: {
      loginMethods: "Påloggingsmetoder",
      phone: "Bind telefonnummer",
      phoneDesc:
        "Brukes for ytterligere påloggingsmetoder, SMS-verifisering og konto sikkerhetsvarsler",
      bindPhone: "Bind",
      bindPhoneTitle: "Bind telefonnummer",
      bindPhoneHint:
        "Verifiser telefonnummeret først før du binder det. Verifiseringskoden vil bli sendt til dette telefonnummeret.",
      rebindPhoneHint:
        "For å erstatte det bundede telefonnummeret, verifiser først det gjeldende telefonnummeret og deretter det nye.",
      currentPhone: "For øyeblikket bundet telefonnummer",
      currentPhoneCode: "Gjeldende telefonverifiseringskode",
      currentPhoneCodePlaceholder:
        "Skriv inn 6-sifrede koden sendt til det gjeldende telefonnummeret",
      sendCurrentPhoneCode: "Send gjeldende telefonkode",
      newPhone: "Telefonnummer",
      newPhoneCode: "Ny telefonverifiseringskode",
      newPhonePlaceholder: "Skriv inn et telefonnummer, for eksempel 13800138000",
      smsCode: "SMS-verifiseringskode",
      smsCodePlaceholder: "Skriv inn 6-sifrede SMS-koden",
      safeEmail: "Sikker e-post",
      safeEmailDesc: "Primær legitimasjon brukt for å logge inn",
      editEmailTitle: "Endre sikker e-post",
      newEmail: "Ny e-post",
      newEmailPlaceholder: "Skriv inn den nye e-postadressen",
      emailCode: "E-postkode",
      emailCodePlaceholder: "Skriv inn 6-sifrede koden",
      changeEmailHint:
        "Den nye e-posten må verifiseres før endringen lagres.",
      changePassword: "Endre passord",
      changePasswordDesc:
        "Oppdater ditt påloggings passord regelmessig for å forbedre konto sikkerheten",
      editPasswordTitle: "Endre påloggings passord",
      currentPassword: "Gjeldende passord",
      currentPasswordPlaceholder: "Skriv inn ditt gjeldende passord",
      currentPasswordIncorrect: "Det gjeldende passordet er feil",
      newPassword: "Nytt passord",
      newPasswordPlaceholder: "Skriv inn et nytt passord med minst 8 tegn",
      confirmPassword: "Bekreft nytt passord",
      confirmPasswordPlaceholder: "Skriv inn det nye passordet igjen",
      changePasswordHint:
        "Bruk det nye passordet neste gang du logger inn, og unngå å gjenbruke det gamle.",
      passwordMinLength: "Passordet må være minst 8 tegn",
      passwordMismatch: "De to nye passordene samsvarer ikke",
      passwordUpdated: "Passord oppdatert",
      passwordUpdateFailed: "Kunne ikke oppdatere passord",
      mfa: "Tofaktorautentisering",
      mfaDesc: "Når det er aktivert, kreves ekstra verifisering under pålogging",
      mfaTitle: "Konfigurer tofaktorautentisering",
      mfaHint: "Velg den andre verifiseringsmetoden som brukes under pålogging.",
      mfaTitleEnable: "Aktiver tofaktorautentisering",
      mfaTitleDisable: "Deaktiver tofaktorautentisering",
      mfaHintEnable:
        "Velg den andre verifiseringsmetoden som brukes under pålogging.",
      mfaHintDisable:
        "Etter deaktivering, kreves ikke ekstra verifisering under pålogging lenger.",
      mfaMethod: "Verifiseringsmetode",
      mfaMethodEmail: "E-postkode",
      mfaMethodSMS: "Telefonkode",
      passkeys: "Passordnøkler",
      passkeysDesc:
        "Etter binding kan du logge inn direkte fra systemets passordnøkkel velger.",
      addPasskey: "Legg til passordnøkkel",
      deletePasskey: "Slett passordnøkkel",
      passkeyName: "Enhetsnavn",
      passkeyNamePlaceholder: "Skriv inn et gjenkjennelig navn",
      passkeyLastUsed: "Sist brukt",
      passkeyLastUsedIP: "Sist brukt IP",
      passkeyCreatedAt: "Opprettet",
      passkeyEmpty: "Ingen passordnøkler bundet",
      passkeyManageVerify:
        "For å beskytte kontoen din, verifiser dine gjeldende legitimasjoner før du legger til eller sletter en passordnøkkel.",
      currentMfaCode: "Gjeldende MFA-kode",
      currentMfaCodePlaceholder: "Skriv inn koden fra den gjeldende MFA-metoden",
      currentMfaCodeHintEmail:
        "Fullfør verifisering med den for øyeblikket bundede e-postkoden før du lagrer.",
      currentMfaCodeHintSMS:
        "Fullfør verifisering med den for øyeblikket bundede telefonkoden før du lagrer.",
      currentMfaCodeHintManual:
        "Skriv inn den for øyeblikket konfigurerte manuelle MFA-koden før du lagrer.",
      accountSecurity: "Konto sikkerhet",
      recentLogin: "Siste pålogging",
      recentLoginDesc: "Siste vellykkede påloggings tid og enhets IP",
    },
    profile: {
      title: "Profil",
      avatar: "Avatar",
      avatarDesc:
        "Bildet vil automatisk bli senterbeskjært og konvertert til webp",
      nickname: "Kallenavn",
      nicknameDesc: "Gjeldende visningsnavn",
      gender: "Kjønn",
      genderDesc: "Profil kjønnsinformasjon for denne kontoen",
      languagePreference: "Språkforetrekking",
      languagePreferenceDesc:
        "Etter pålogging vil dette språket brukes først for sideinnhold",
      languagePreferenceSaved: "Språkforetrekking lagret",
      languagePreferenceSaveFailed: "Kunne ikke lagre språkforetrekking",
      genderMale: "Mann",
      genderFemale: "Kvinne",
      genderOther: "Annet",
      userId: "Bruker ID",
      userIdDesc: "Unik identifikator for den gjeldende kontoen i systemet",
      nicknamePlaceholder: "Skriv inn kallenavn",
      editNicknameTitle: "Endre kallenavn",
      editGenderTitle: "Endre kjønn",
      email: "E-postadresse",
      emailDesc: "Brukes for pålogging, verifisering og sikkerhetsvarsler",
      createdAt: "Registrert",
      createdAtDesc: "Tidspunktet da denne kontoen ble opprettet",
      country: "Registreringsland",
      countryDesc: "Land eller region registrert ved registrering",
    },
    privacy: {
      title: "Personvern senter",
      exportTitle: "Last ned brukerdata",
      exportDesc:
        "Eksporter profildata og ikke-tilbakekallede autoriserte applikasjoner i CSV format.",
      exportAction: "Last ned data",
      exportPasswordVerifyDesc:
        "Verifiser ditt gjeldende påloggings passord før nedlasting. CSV vil inkludere profildata og ikke-tilbakekallede autoriserte applikasjoner.",
      exportSuccess: "Brukerdata nedlasting startet",
      exportFailed: "Kunne ikke eksportere brukerdata",
      minimizeTitle: "Dataminimering",
      minimizeDesc:
        "Systemet behold bare registreringslandet, e-posten, samtykker og essensielle påloggingssikkerhetsdata.",
      scopeTitle: "Gjeldende tilgangsomfang",
      scopeDesc:
        "Du kan gjennomse applikasjoner som tilgang til din konto i Autoriserte applikasjoner og tilbakekalle dem når som helst.",
      statusTitle: "Konto status",
      statusDesc:
        "Hvis kontoen er frosset, vil pålogging blokkere inntil en administrator løser det.",
      deleteTitle: "Slett konto",
      deleteDesc:
        "Hvis du logger inn igjen innen 7 dager, avbrytes sletteforespørselen automatisk. Ellers vil kontoen og samtykkedataen bli fjernet.",
      deleteWarningPrimary:
        "Å slette kontoen er irreversibelt. Vennligst sikkerhetskopier data knyttet til denne kontoen først.",
      deleteWarningSecondary:
        "Etter at forespørselen er sendt, avbrytes slettingen hvis du logger inn igjen innen 7 dager. Hvis du ikke logger inn innen 7 dager, sletter systemet kontoen og samtykkedataen automatisk.",
      deleteAction: "Jeg har lest og aksepterer konsekvensene",
      passwordVerifyTitle: "Verifiser gjeldende passord",
      passwordVerifyDesc:
        "Skriv inn ditt gjeldende påloggings passord og fullfør e-postverifisering. Hvis et telefonnummer er bundet, kreves også telefonverifisering.",
      emailVerifyCode: "E-postverifiseringskode",
      emailVerifyCodePlaceholder: "Skriv inn 6-sifrede koden sendt til e-posten din",
      sendDeleteEmailCode: "Send e-postkode",
      sendDeleteEmailCodeSuccess:
        "E-postverifiseringskoden har blitt sendt. Vennligst sjekk innboksen din.",
      sendDeleteEmailCodeFailed: "Kunne ikke sende e-postverifiseringskoden",
      phoneVerifyCode: "Telefonverifiseringskode",
      phoneVerifyCodePlaceholder: "Skriv inn 6-sifrede koden sendt til telefonen din",
      sendDeletePhoneCode: "Send telefonkode",
      sendDeletePhoneCodeSuccess:
        "Telefonverifiseringskoden har blitt sendt. Vennligst sjekk telefonen din.",
      sendDeletePhoneCodeFailed: "Kunne ikke sende telefonverifiseringskoden",
      confirmDeleteNow: "Send sletteforespørsel",
      deleteSuccess:
        "Sletteforespørsel sendt. Logging inn innen 7 dager vil avbryte den.",
      deleteFailed: "Kunne ikke sende sletteforespørsel",
      deletePendingAt:
        "Sletteforespørsel sendt. Planlagt slettingstid: {{date}}",
    },
    bindings: {
      title: "Autoriserte applikasjoner",
      appId: "Applikasjonsnavn",
      scopes: "Omfang",
      createdAt: "Autoriserte",
      authorizedAt: "Autoriserte",
      action: "Handling",
      viewDetails: "Detaljer",
      detailTitle: "Autorisasjonsdetaljer",
      siteName: "Autoriserte nettsted",
      requestedPermissions: "Gitte tillatelser",
      scopeOpenIdTitle: "Bekreft din identitet",
      scopeOpenIdDesc:
        "Brukes for å bekrefte at den innloggede kontoen virkelig er deg og etablere den grunnleggende påloggingsøkten.",
      scopeProfileTitle: "Tilgang til din offentlige profil",
      scopeProfileDesc:
        "Inkluderer kallenavn, avatar og annen offentlig profildata for visning inne i applikasjonen.",
      scopeEmailTitle: "Tilgang til din e-postadresse",
      scopeEmailDesc:
        "Brukes for å vise din konto e-post eller sende varsler og binde kontoen din når det er nødvendig.",
      scopePhoneTitle: "Tilgang til ditt telefonnummer",
      scopePhoneDesc:
        "Brukes for kontoidentifikasjon, varsler eller sikkerhetsverifisering når det er nødvendig.",
      scopeGatewayReadTitle: "Tilgang til beskyttede forretnings API-er",
      scopeGatewayReadDesc:
        "Tillater applikasjonen å få tilgang til beskyttede API-ressurser på dine vegne etter autorisasjon.",
      scopeCustomTitle: "Forespurt tillatelse: {{scope}}",
      scopeCustomDesc:
        "Denne applikasjonen ber om en ekstra forretningstillatelse. Gjenomse den nøye før du fortsetter.",
      revoke: "Tilbakekall",
      batchRevoke: "Batch tilbakekall",
      batchRevokeConfirmTitle: "Bekreft batch tilbakekall?",
      batchRevokeConfirmDesc:
        "{{count}} autoriseringer er valgt. Disse applikasjonene vil måtte be om samtykke igjen.",
    },
    help: {
      title: "Hjelpesenter",
      loginIssueTitle: "Kan ikke logge inn",
      loginIssueDesc:
        "Hvis du ikke kan logge inn, bekrefte først at du bruker den riktige metoden for kontoen, som passord, e-postkode, telefonkode eller passordnøkkel. Hvis en verifiseringskode avvises, sørg for at det er den nyeste og fortsatt innen gyldighetsperioden. Hvis kontoen vises som frosset, ventende aktivering eller annen begrenset, må problemet håndteres av en plattformadministrator. Hvis du nylig sendte en konto sletteforespørsel, kan systemet også kreve sletting bekreftelse eller telefonbinding før tilgang gjenopprettes.",
      protectTitle: "Beskytter din konto",
      protectDesc:
        "Aktiver tofaktorautentisering så snart som mulig og bind passordnøkler på pålitelige enheter for å redusere risikoen for passord-kompromiss. Del aldri e-postkoder, SMS-koder eller MFA-koder med tredjeparter, og ikke skriv inn legitimasjoner på sider du ikke stoler på. Hvis du bruker samme konto på flere enheter, gjennomse regelmessig siste pålogginger, bundede passordnøkler og autoriserte applikasjoner, og fjern enheter eller autorisasjoner du ikke lenger bruker.",
      authIssueTitle: "Autorisasjons problemer",
      authIssueDesc:
        "Hvis en applikasjon ser ukjent ut, ber om uvanlige omfang eller du mistenker den misbruker kontoen din, åpne Autoriserte applikasjoner for å gjennomse dens autorisasjonstid, gitte omfang og integrasjonsdetaljer, og tilbakekall den umiddelbart hvis nødvendig. Etter tilbakekalling, vil applikasjonen ikke lenger kunne få tilgang til beskyttede ressurser med kontoen din før du logger inn igjen og godtar en ny samtykkeforespørsel. Hvis problemet kan påvirke hele kontoen i stedet for en enkelt applikasjon, bør du også endre passordet ditt, verifisere MFA-innstillingene dine og gjennomse siste pålogging og passordnøkkel aktivitet.",
      contactTitle: "Kontakt oss",
      contactDesc:
        "Hvis du trenger manuell assistanse, kan du kontakte plattformstøtte kontakten nedenfor. Når du rapporterer et problem, inkluder konto e-post, tidspunktet problem oppstod, skjermbilder av feilmeldinger, påloggingsmetoden du brukte, og relevante enhets- eller nettleserdetaljer slik at problemet kan undersøkes raskere.",
      contactMainlandTitle: "Hovedland Kina",
      contactOverseasTitle: "Utlandet",
      contactPersonLabel: "Kontaktperson:",
      contactPhoneLabel: "Telefon:",
      contactEmailLabel: "E-post:",
      contactHoursLabel: "Støtte timer:",
      contactMainlandPersonValue: "YOUR_NAME",
      contactMainlandPhoneValue: "YOUR_PHONE_NUMBER",
      contactMainlandEmailValue: "YOUR_EMAIL",
      contactMainlandHoursValue: "Mandag til fredag 09:00 - 18:00",
      contactOverseasPersonValue: "Skal leveres",
      contactOverseasPhoneValue: "Skal leveres",
      contactOverseasEmailValue: "Skal leveres",
      contactOverseasHoursValue: "Mandag til fredag 09:00 - 18:00",
      contactRegionNotice:
        "Vennligst kontakt støttekanalen for din region først. Hvis du er usikker på hvilken region som gjelder, start med Hovedland Kina kontakt for rutinghjelp.",
      contactNotice:
        "For problemer som frosne kontoer, unormale autorisasjoner, mistede passordnøkler eller slettegjenoppretting, kontakt administratoren gjennom telefonnummeret eller e-posten ovenfor først. Hvis plattformen din tilbyr et offisielt sakssystem, kunngjøringstavle eller operasjonsgruppe, følg den offisielle kanalen først.",
    },
  },
} as const;

export default locale;
