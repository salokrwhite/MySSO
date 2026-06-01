const locale = {
  translation: {
    header: {
      language: "Taal",
      languageModalTitle: "Kies taal",
      languageModalDesc: "Selecteer de gebruikersinterface-taal die u wilt gebruiken.",
      agreement: "Gebruikersovereenkomst",
      privacy: "Privacybeleid",
      help: "Helpcentrum",
      logout: "Uitloggen",
      accountCenter: "Accountcentrum",
    },
    legal: {
      back: "Terug naar start",
      updatedAt: "Laatst bijgewerkt: {{date}}",
      agreement: {
        title: "Gebruikersovereenkomst",
        updatedAt: "2026-03-16",
        intro:
          "Welkom bij {{siteName}}. Voordat u zich registreert, inlogt, integreert of de eenheidsauthenticatieservices gebruikt, lees deze overeenkomst zorgvuldig door. Door te blijven gebruiken van de service, gaat u akkoord met deze overeenkomst.",
        sections: {
          accountTitle: "1. Account en inloggen",
          accountP1:
            "U moet waar, wettig en bereikbaar registratiegegevens verstrekken en uw account, wachtwoord, verificatiecodes en andere referenties goed beschermen. U bent verantwoordelijk voor verliezen veroorzaakt door onvoldoende beheer van referenties aan uw zijde.",
          accountP2:
            "Als er abnormale inlogactiviteit, overtredingen van beleid, bevroren status of beveiligingsrisico's worden gedetecteerd, kan het platform aanvullende verificatie vereisen, inloggen beperken of toegang tijdelijk opheffen voor veiligheidsredenen.",
          acceptableUseTitle: "2. Acceptabel gebruik",
          acceptableUseP1:
            "U mag dit systeem niet gebruiken voor enige onwettige activiteit, rechteninbreuk, misbruik van authenticatie-interfaces, massa-aanvragen, referentie-stuffing of enig gedrag dat de platformstabiliteit bedreigt of beveiligingscontroles omzeilt.",
          acceptableUseP2:
            "Als u deze overeenkomst of gerelateerde regels overtredt, kan het platform een deel of al uw toegang tijdelijk opheffen of beëindigen en behoudt het zich het recht voor om verantwoordelijkheid na te gaan wanneer dat nodig is.",
          authorizationTitle: "3. Autorisatie en derde-apps",
          authorizationP1:
            "Wanneer u een {{siteName}}-account gebruikt om in te loggen op een derde-app, vraagt het systeem uw toestemming op basis van de machtigingen die op de autorisatiepagina worden weergegeven. U kunt deze toestemming op elk moment in het accountcentrum weigeren of intrekken.",
          authorizationP2:
            "Elk gebruik van uw gegevens door een derde-app na autorisatie wordt geregeld door de eigen servicevoorwaarden en privacybeleid van die app. Het platform neemt alleen verantwoordelijkheid binnen het door de wet vereiste bereik.",
          developerTitle: "4. Ontwikkelaarintegratie",
          developerP1:
            "Ontwikkelaars moeten ervoor zorgen dat app-informatie, omleidings-URI's, gevraagde scopes en zakelijke doeleinden waar, compleet en continu geldig zijn, en gebruikers niet mogen misleiden.",
          developerP2:
            "Het platform kan verbonden apps controleren, weigeren, delisten, verwijderen of beperken om de beveiliging en integriteit van het eenheidsidentiteits-ecosysteem te handhaven.",
          liabilityTitle: "5. Dienstveranderingen en beperking van aansprakelijkheid",
          liabilityP1:
            "Om veiligheids-, nalevings-, operatie- of onderhoudsredenen kan het platform bepaalde interfaces, stromen of functies aanpassen, upgraden, tijdelijk opheffen of beëindigen, en zal het proberen op de juiste momenten kennisgeving te doen.",
          liabilityP2:
            "Voor zover de wet dit toestaat, is het platform niet aansprakelijk buiten wettelijke verplichtingen voor onderbrekingen, abnormale gegevens of verliezen veroorzaakt door overmacht, netwerkstoringen, derde-partijredenen of onjuist gebruik aan uw zijde.",
        },
      },
      privacy: {
        title: "Privacybeleid",
        updatedAt: "2026-03-16",
        intro:
          "{{siteName}} waardeert uw persoonlijke gegevens en accountbeveiliging. Dit beleid legt uit hoe we uw gegevens verzamelen, gebruiken, opslaan, delen en beschermen, evenals de rechten die voor u beschikbaar zijn.",
        sections: {
          dataCollectionTitle: "1. Gegevens die we verzamelen",
          dataCollectionP1:
            "Wanneer u zich registreert, inlogt of accountservices gebruikt, kunnen we uw registratieland, e-mailadres, telefoonnummer, wachtwoordhash, inlogsessies, apparaat-IP, autorisatierecords en noodzakelijke beveiligingslogboeken verzamelen.",
          dataCollectionP2:
            "Wanneer u een avatar uploadt, uw profiel wijzigt, een telefoonnummer bindt, MFA inschakelt of een derde-app autoriseert, verwerken we de door u ingediende gegevens zoals nodig om die functie te bieden.",
          dataUsageTitle: "2. Hoe we gegevens gebruiken",
          dataUsageP1:
            "We gebruiken relevante gegevens om accountregistratie, inlogauthenticatie, verificatiecodebezorging, risicobeheer, autorisatiebevestiging, ontwikkelaar-appcontrole, accountbeveiligingsmeldingen en servicetrouwbaarheidsonderhoud te bieden.",
          dataUsageP2:
            "We analyseren ook logboeken en statistieken op een minimalistisch noodzakelijk niveau om abnormale activiteit te detecteren, de productervaring te verbeteren en de beveiliging te versterken.",
          dataSharingTitle: "3. Delen en openbaarmaking",
          dataSharingP1:
            "We verstrekken alleen identiteitsinformatie of machtigingsgerelateerde gegevens aan derde-apps wanneer u expliciet de scopes die op de autorisatiepagina worden weergegeven, autoriseert.",
          dataSharingP2:
            "Behalve waar de wet het vereist, bij regelgevingsverzoeken, bescherming van het publieke belang of systeembeveiligingsbehoeften, verkopen of delen we uw persoonlijke gegevens niet onwettig met niet-verwante derden.",
          userRightsTitle: "4. Uw rechten",
          userRightsP1:
            "U kunt uw profiel, bindingen, autorisatierecords en beveiligingsinstellingen in het accountcentrum bekijken en bijwerken, en u kunt app-toestemmingen intrekken of een accountverwijderingsverzoek indienen.",
          userRightsP2:
            "Als u denkt dat uw gegevens onjuist, onjuist verwerkt of buiten de noodzaak gebruikt worden, kunt u contact opnemen met de platformoperator of uw rechten uitoefenen onder toepasselijk recht.",
          securityTitle: "5. Bescherming en retentie",
          securityP1:
            "We gebruiken toegangscontroles, wachtwoordhashing, verificatiecodeverval, auditlogboeken en dataminimalisatiemaatregelen om uw persoonlijke gegevens en authenticatiegegevens te beschermen.",
          securityP2:
            "Onderhevig aan juridische en zakelijke vereisten, bewaren we uw gegevens alleen zolang nodig is om dienstdoeleinden te vervullen; na accountverwijdering of verloop van retentieperioden, zullen we de gegevens verwijderen of anonimiseren volgens het beleid.",
        },
      },
    },
    auth: {
      noAccount: "Geen account?",
      registerNow: "Registreer nu",
      registerPageTitle: "Account aanmaken",
      registerPageSubtitle:
        "Voltooi de registratie met uw land, e-mail en e-mailverificatiecode.",
      registerDisabled: "Registratie is momenteel uitgeschakeld",
      registerSuccess:
        "Registratie geslaagd. Log in met uw wachtwoord.",
      phoneBindingRequiredAfterRegister:
        "Registratie geslaagd. Bind uw telefoonnummer eerst om het account te activeren.",
      registerFailed: "Registratie mislukt",
      country: "Land",
      countryRequired: "Selecteer een land",
      registerCode: "E-mailcode",
      registerCodeRequired: "Voer de e-mailverificatiecode in",
      registerCodePlaceholder: "Voer de 6-cijferige code in",
      sendRegisterCode: "Code verzenden",
      sendRegisterCodeSuccess:
        "De verificatiecode is verzonden. Controleer uw inbox.",
      sendRegisterCodeFailed: "Verificatiecode verzenden mislukt",
      backToLoginWithAccount: "Heeft u al een account? Log in",
      forgotPassword: "Wachtwoord vergeten?",
      forgotPasswordPageTitle: "Wachtwoord opnieuw instellen",
      forgotPasswordPageSubtitle:
        "Herstel uw inlogwachtwoord met uw geregistreerde e-mail en verificatiecode.",
      forgotPasswordPrompt: "Wachtwoord vergeten?",
      forgotPasswordAction: "Herstel het",
      forgotPasswordDesc:
        "Na verificatie van uw e-mail met een code, kunt u direct een nieuw inlogwachtwoord instellen.",
      forgotPasswordHint:
        "Voer uw geregistreerde e-mail, de verificatiecode en een nieuw wachtwoord in. U kunt direct na indiening inloggen met het nieuwe wachtwoord.",
      goToOtpLogin: "Gebruik e-mailcode inloggen",
      resetCode: "Herstelcode",
      sendResetCode: "Herstelcode verzenden",
      sendResetCodeSuccess:
        "De herstelcode is verzonden. Controleer uw inbox.",
      sendResetCodeFailed: "Verzenden van herstelcode mislukt",
      resetPassword: "Wachtwoord opnieuw instellen",
      resetPasswordSuccess:
        "Wachtwoord succesvol opnieuw ingesteld. Log in met uw nieuwe wachtwoord.",
      resetPasswordFailed: "Wachtwoord opnieuw instellen mislukt",
      newPassword: "Nieuw wachtwoord",
      confirmNewPassword: "Bevestig nieuw wachtwoord",
      newPasswordPlaceholder: "Voer een wachtwoord in van minimaal 8 tekens",
      confirmPassword: "Bevestig wachtwoord",
      confirmPasswordPlaceholder: "Voer het wachtwoord opnieuw in",
      backToLogin: "Terug naar inloggen",
      emailRequired: "Voer uw e-mail in",
      passwordRequired: "Voer uw wachtwoord in",
      otpCodeRequired: "Voer de e-mailverificatiecode in",
      phoneRequired: "Voer uw telefoonnummer in",
      phoneOtpCodeRequired: "Voer de SMS-verificatiecode in",
      emailInvalid: "Voer een geldig e-mailadres in",
      resetCodeRequired: "Voer de herstelcode in",
      resetCodePlaceholder: "Voer de 6-cijferige herstelcode in",
      newPasswordRequired: "Voer een nieuw wachtwoord in",
      confirmNewPasswordRequired: "Bevestig het nieuwe wachtwoord opnieuw",
      newPasswordMinLength: "Nieuw wachtwoord moet minimaal 8 tekens lang zijn",
      passwordMinLength: "Wachtwoord moet minimaal 8 tekens lang zijn",
      newPasswordMismatch: "De twee nieuwe wachtwoorden komen niet overeen",
      passwordMismatch: "De twee wachtwoorden komen niet overeen",
      registrationClosed: "Registratie is momenteel gesloten",
      login: "Inloggen",
      passkeyLogin: "Passkey",
      passkeyLoginDesc:
        "Gebruik een passkey die al op deze site is gebonden op uw apparaat of systeemaccount.",
      passkeyLoginButton: "Gebruik Passkey",
      passkeyLoginHint:
        "U moet een passkey binden in het accountcentrum voordat u deze hier gebruikt.",
      passkeyLoginSuccess: "Passkey succesvol toegevoegd",
      passkeyNotAvailable:
        "Geen passkey voor deze site is beschikbaar op dit apparaat. Gebruik een andere inlogmethode.",
      passwordLogin: "Wachtwoord",
      otpLogin: "E-mailcode",
      phoneOtpLogin: "Telefooncode",
      email: "E-mail",
      phone: "Telefoonnummer",
      password: "Wachtwoord",
      otpCode: "E-mailcode",
      phoneOtpCode: "SMS-code",
      mfaCode: "2FA-code",
      mfaPlaceholder: "Laat leeg als tweefactorauthenticatie niet is ingeschakeld",
      sendOtpCode: "E-mailcode verzenden",
      sendOtpCodeSuccess:
        "De e-mailcode is verzonden. Controleer uw inbox.",
      sendOtpCodeFailed: "Verzenden van verificatiecode mislukt",
      sendOtpCodeEmailRequired: "Voer uw e-mail in voordat u een code aanvraagt",
      sendPhoneOtpCode: "SMS-code verzenden",
      sendPhoneOtpCodeSuccess:
        "De SMS-code is verzonden. Controleer uw telefoon.",
      sendPhoneOtpCodeFailed: "Verzenden van SMS-code mislukt",
      sendPhoneBindingCode: "Bindingscode verzenden",
      sendPhoneBindingCodeSuccess:
        "De telefoonbindingscode is verzonden. Controleer uw telefoon.",
      sendPhoneBindingCodeFailed: "Verzenden van de telefoonbindingscode mislukt",
      securityCaptcha: "Beveiligingscontrole",
      securityCaptchaPlaceholder:
        "Voer de beveiligingscontrolewaarde in en probeer opnieuw",
      securityCaptchaHelp:
        "Wanneer het huidige apparaat of IP te frequent verzoeken stuurt, voltooi deze beveiligingscontrole voordat u een andere code aanvraagt.",
      securityCaptchaRequiredTip:
        "Aanvraagvolume is hoog. Voltooi de beveiligingscontrole voordat u een andere code aanvraagt.",
      sendOtpCodePhoneRequired:
        "Voer uw telefoonnummer in voordat u een code aanvraagt",
      phoneBindingPageTitle: "Telefoonnummer binden",
      phoneBindingRegisterDesc:
        "Dit account heeft de risicoregel na registratie getroffen. Bind een telefoonnummer voordat u doorgaat.",
      phoneBindingLoginDesc:
        "Dit account heeft de inlogrisicoregel getroffen. Bind een telefoonnummer voordat u doorgaat.",
      completePhoneBinding: "Bind en ga verder",
      phoneBindingSuccess:
        "Telefoonnummer succesvol gebonden. Het account is weer actief.",
      mfaVerifyTitle: "Tweefactorverificatie",
      mfaVerifyEmailHint:
        "Een verificatiecode is verzonden naar {{target}}. Voer deze in om door te gaan met inloggen.",
      mfaVerifyPhoneHint:
        "Een verificatiecode is verzonden naar {{target}}. Voer deze in om door te gaan met inloggen.",
      loginStepUpTitle: "Extra inlogverificatie",
      loginStepUpEmailDesc:
        "Deze inlog vereist een extra e-mailverificatie. Een code wordt verzonden naar {{email}}.",
      loginStepUpSMSDesc:
        "Deze inlog vereist een extra telefoonverificatie. Een code wordt verzonden naar {{phone}}.",
      loginStepUpDualDesc:
        "Deze inlog vereist zowel e-mail- als telefoonverificatie. E-mail: {{email}}, telefoon: {{phone}}.",
      loginStepUpExpired:
        "De extra inlogverificatiesessie is verlopen. Log opnieuw in.",
      forcedMfaEnrollmentTitle: "Tweefactorauthenticatie moet worden ingeschakeld",
      forcedMfaEnrollmentDesc:
        "Een beheerder vereist dat deze account tweefactorauthenticatie inschakelt voordat deze inlog kan worden voltooid.",
      forcedMfaEnrollmentExpired:
        "De geforceerde MFA-inschrijvingssessie is verlopen. Log opnieuw in.",
      completeForcedMfaEnrollment: "Inschakelen en doorgaan",
      cancelForcedMfaEnrollment: "Annuleren en terugkeren naar inloggen",
      verifyAndLogin: "Verifiëren en inloggen",
      deletionConfirmTitle: "Accountverwijderingsverzoek ingediend",
      deletionConfirmScheduledAt: "Geplande verwijderingstijd: {{date}}",
      deletionConfirmDesc:
        "Opnieuw inloggen annuleert de verwijdering.",
      deletionConfirmContinue: "Doorgaan en verwijdering annuleren",
      deletionConfirmExpired: "Bevestiging verlopen, log opnieuw in",
      deletionConfirmFailed: "Bevestiging mislukt, log opnieuw in",
      logoutProgressTitle: "Uitloggen",
      logoutProgressDesc:
        "De identiteitsessie is gewist en verbonden applicaties worden uitgelogd.",
      loginFailed: "Inloggen mislukt",
      oidcCallbackFailed: "OIDC-callback mislukt",
      appRejected: "Applicatie afgewezen",
      appRejectedWithReason: "Applicatie afgewezen: {{reason}}",
      appNotFound: "Applicatie niet gevonden",
      accessDenied: "Toegang geweigerd",
      tokenExchangeFailed: "Tokenuitwisseling mislukt",
      authorize: {
        title: "Gebruik {{siteName}} om in te loggen op {{appName}}",
        desc: "Deze app vraagt de volgende informatie en machtigingen aan. Na bevestiging keert u terug naar de zakelijke app om inloggen te voltooien.",
        chooseAccountTitle: "U bent al ingelogd op {{siteName}}",
        chooseAccountDesc:
          "Kies of u doorgaat met het huidige account of eerst inlogt met een ander account.",
        currentAccountFallback: "Huidig account",
        useCurrentAccount: "Doorgaan met dit account",
        useAnotherAccount: "Inloggen met een ander account",
        permissionTitle: "Gevraagde machtigingen",
        permissionCount: "{{count}} items",
        agreement:
          "Ik heb gelezen en ga akkoord met het verlenen van de bovenstaande machtigingen",
        confirm: "Bevestigen en doorgaan",
        cancel: "Annuleren en terugkeren naar inloggen",
        errors: {
          applicationRejected: "Applicatie afgewezen",
          applicationRejectedWithReason: "Applicatie afgewezen: {{reason}}",
          applicationAccessRestricted: "Toegang tot de applicatie is beperkt",
          applicationAccessBanned: "Toegang tot de applicatie is verboden",
          applicationAccessBannedWithReason: "Toegang tot de applicatie is verboden: {{reason}}",
          applicationNotApproved: "Applicatie niet goedgekeurd",
          applicationNotFound: "Applicatie niet gevonden",
          forbidden: "U hebt geen toestemming om toegang te krijgen tot deze applicatie",
          unsupportedResponseType: "Niet ondersteund antwoordtype",
          redirectUriMismatch: "Omleidings-URI komt niet overeen",
          scopeNotAllowed: "Gevraagde scope is niet toegestaan",
          openidScopeRequired: "OpenID-scope is vereist",
          codeChallengeMethodRequiresCodeChallenge:
            "Wanneer code_challenge_method wordt opgegeven, moet ook code_challenge worden opgegeven",
          unsupportedCodeChallengeMethod: "Niet ondersteunde code challenge-methode",
          promptNoneMustNotBeCombinedWithOtherValues:
            "De waarde 'none' in prompt mag niet worden gecombineerd met andere waarden",
          invalidMaxAge: "De max_age-waarde is ongeldig",
          acrValuesNotSatisfied: "De huidige inlogsessie voldoet niet aan de gevraagde authenticatiecontext",
          consentRequired: "Extra toestemming vereist",
          loginRequired: "Log a.u.b. opnieuw in om door te gaan",
          authorizeFailed: "Autorisatie mislukt, probeer het later opnieuw",
          loadAuthorizationSettingsFailed: "Laden van autorisatie-instellingen is mislukt",
          networkRequestFailed: "Netwerkverzoek mislukt, controleer uw verbinding en probeer opnieuw",
          apiReturnedHtml: "De autorisatieservice retourneerde een onverwachte pagina. Controleer de API- of reverse proxy-configuratie.",
        },
        scopes: {
          openidTitle: "Bevestig uw identiteit",
          openidDesc:
            "Gebruikt om te verifiëren dat het huidige ingelogde account van u is en om de basisinlogsessie op te zetten.",
          profileTitle: "Toegang tot uw publieke profiel",
          profileDesc:
            "Inclusief uw weergavenaam, avatar en soortgelijke publieke profielgegevens voor presentatie in de app.",
          emailTitle: "Toegang tot uw e-mailinformatie",
          emailDesc:
            "Gebruikt om uw account-e-mail weer te geven of ondersteuningsmeldingen en accountkoppeling wanneer nodig.",
          phoneTitle: "Toegang tot uw telefoonnummer",
          phoneDesc:
            "Gebruikt voor accountherkenning, meldingen of beveiligingsverificatie wanneer nodig.",
          gatewayReadTitle: "Toegang tot beveiligde zakelijke API's",
          gatewayReadDesc:
            "Staat de app toe om beveiligde bronnen te benaderen als uw geautoriseerde identiteit.",
          customTitle: "Machtiging gevraagd: {{scope}}",
          customDesc:
            "Deze app vraagt een extra zakelijke machtiging aan. Beoordeel het zorgvuldig voordat u doorgaat.",
        },
      },
      sessionConflict: {
        title: "Verschillende accounts werden gedetecteerd in deze browser",
        desc: "Het account dat door dit venster wordt herinnerd komt niet overeen met het momenteel actieve account van de browser. Er kan slechts één primair account tegelijk actief zijn in dezelfde browser. Kies welk account u wilt blijven gebruiken.",
        browserAccount: "Browser actief account",
        thisWindowAccount: "Vorig account van dit venster",
        useBrowserAccount: "Gebruik het browser actieve account",
        useThisWindowAccount: "Terugschakelen naar het account van dit venster",
        relogin: "Uitloggen en opnieuw inloggen",
      },
    },
    nav: {
      security: "Inloggen & Beveiliging",
      profile: "Profiel",
      privacy: "Privacycentrum",
      bindings: "Geautoriseerde apps",
      help: "Helpcentrum",
    },
    common: {
      loadingFailed: "Laden mislukt",
      revokeFailed: "Intrekken van toestemming mislukt",
      revokeSuccess: "Toestemming ingetrokken",
      confirm: "Bevestigen",
      sendCode: "Code verzenden",
      sendCodeSuccess: "Verificatiecode succesvol verzonden",
      sendingCode: "Verzenden",
      save: "Opslaan",
      saving: "Opslaan",
      edit: "Bewerken",
      cancel: "Annuleren",
      uploadAvatar: "Avatar uploaden",
      avatarUpdated: "Avatar bijgewerkt",
      avatarUploadFailed: "Uploaden van avatar mislukt",
      profileUpdated: "Profiel bijgewerkt",
      profileUpdateFailed: "Bijwerken van profiel mislukt",
      imageReadFailed: "Afbeelding lezen mislukt",
      imageProcessUnsupported:
        "Afbeeldingsverwerking wordt niet ondersteund in deze browser",
      avatarConvertFailed: "Avatarconversie mislukt",
      unset: "Niet ingesteld",
      unsetShort: "Niet ingesteld",
      notFilled: "Niet opgegeven",
      noRecord: "Geen records",
      normal: "Actief",
      accountCenter: "Accountcentrum",
      noAuthorizedApps: "Geen geautoriseerde apps",
    },
    errors: {
      emailRequiredByServer: "Voer uw e-mail in",
      passwordRequiredByServer: "Voer uw wachtwoord in",
      invalidCredentials: "Ongeldig account of referenties",
      invalidOtpCode: "De verificatiecode is ongeldig of verlopen",
      accountFrozen: "Dit account is bevroren",
      accountFrozenWithReason:
        "Dit account is bevroren. Reden: {{reason}}",
      userNotFound: "Gebruiker niet gevonden",
      smsNotConfigured: "SMS-verzending is niet geconfigureerd",
      smtpNotConfigured: "E-mailverzending is niet geconfigureerd",
      userStatusInvalid:
        "De huidige accountstatus staat deze actie niet toe",
      invalidCurrentPhoneVerificationCode:
        "De huidige telefoonverificatiecode is ongeldig of verlopen",
      invalidNewPhoneVerificationCode:
        "De nieuwe telefoonverificatiecode is ongeldig of verlopen",
      currentPhoneVerificationCodeRequired:
        "Voer de huidige telefoonverificatiecode in",
      currentPhoneNotBound:
        "Er is geen telefoonnummer momenteel gebonden aan dit account",
      phoneDoesNotMatchCurrentBoundPhone:
        "Het telefoonnummer komt niet overeen met het momenteel gebonden nummer",
      phoneAlreadyBound: "Dit telefoonnummer is al gebonden",
      newPhoneMustBeDifferent:
        "Het nieuwe telefoonnummer moet verschillend zijn van het huidige",
      phoneAndVerificationCodeRequired:
        "Voer het telefoonnummer en de nieuwe telefoonverificatiecode in",
      invalidMfaCode: "De tweefactorverificatiecode is ongeldig of verlopen",
      unsupportedMfaMethod: "Niet-ondersteunde tweefactorauthenticatiemethode",
      mfaNotEnabled:
        "Tweefactorauthenticatie is niet ingeschakeld voor dit account",
      emailNotBound: "Er is geen e-mail gebonden aan dit account",
      phoneNotBound: "Er is geen telefoonnummer gebonden aan dit account",
      emailVerificationCodeRequired: "Voer de e-mailverificatiecode in",
      invalidEmailVerificationCode:
        "De e-mailverificatiecode is ongeldig of verlopen",
      phoneVerificationCodeRequired: "Voer de telefoonverificatiecode in",
      invalidPhoneVerificationCode:
        "De telefoonverificatiecode is ongeldig of verlopen",
      newPasswordMustBeDifferentFromCurrentPassword:
        "Het nieuwe wachtwoord moet verschillend zijn van het huidige wachtwoord",
      phoneBindingChallengeExpired:
        "De telefoonbindingssessie is verlopen. Log opnieuw in of registreer opnieuw.",
      manualMfaCodeNotSendable:
        "Dit account gebruikt een handmatige MFA-code en kan geen code verzenden",
      emailAndPasswordRequired:
        "Voer uw e-mail en wachtwoord in voordat u een tweefactorcode aanvraagt",
      mfaChallengeExpiredOrInvalid:
        "De tweefactorverificatiesessie is verlopen. Log opnieuw in.",
      challengeRequired:
        "Voltooi de beveiligingsuitdaging voordat u een code aanvraagt.",
      captchaRequired:
        "Aanvraagvolume is hoog. Voltooi eerst de beveiligingscontrole.",
      circuitOpen:
        "Het bezorgkanaal is tijdelijk beschermd. Probeer het later opnieuw.",
      cooldownActive:
        "Dit doel heeft te frequent codes aangevraagd. Probeer het later opnieuw.",
      passkeyChallengeExpired: "De passkeysessie is verlopen. Probeer het opnieuw.",
      passkeyVerificationFailed:
        "Passkeyverificatie mislukt. Probeer opnieuw of gebruik een andere inlogmethode.",
      passkeyAlreadyExists: "Deze passkey is al gebonden.",
      passkeyNotFound: "Passkey niet gevonden.",
      passkeyBrowserUnsupported:
        "Deze browser of het apparaat ondersteunt geen passkeys.",
      passkeyUserHandleInvalid:
        "Het account voor deze passkey kon niet worden geïdentificeerd.",
      invalidLoginStepUpVerificationCode:
        "De extra verificatiecode is ongeldig of verlopen.",
      loginStepUpChallengeExpiredOrInvalid:
        "De extra verificatiesessie is verlopen. Log opnieuw in.",
      mfaEnrollmentChallengeExpiredOrInvalid:
        "De geforceerde MFA-inschrijvingssessie is verlopen. Log opnieuw in.",
      noAvailableMfaMethodForCurrentAccount:
        "Er is geen MFA-methode beschikbaar voor dit account.",
      noAvailableLoginVerificationTargetForCurrentAccount:
        "Er is geen extra verificatiedoel beschikbaar voor dit account.",
    },
    security: {
      loginMethods: "Inlogmethoden",
      phone: "Telefoonnummer binden",
      phoneDesc:
        "Gebruikt voor extra inlogmethoden, SMS-verificatie en accountbeveiligingsberichten",
      bindPhone: "Binden",
      bindPhoneTitle: "Telefoonnummer binden",
      bindPhoneHint:
        "Verifieer eerst het telefoonnummer voordat u het bindt. De verificatiecode wordt naar dit telefoonnummer verzonden.",
      rebindPhoneHint:
        "Om het gebonden telefoonnummer te vervangen, verifieer eerst het huidige telefoonnummer en vervolgens het nieuwe.",
      currentPhone: "Momenteel gebonden telefoonnummer",
      currentPhoneCode: "Huidige telefoonverificatiecode",
      currentPhoneCodePlaceholder:
        "Voer de 6-cijferige code in die is verzonden naar het huidige telefoonnummer",
      sendCurrentPhoneCode: "Huidige telefooncode verzenden",
      newPhone: "Telefoonnummer",
      newPhoneCode: "Nieuwe telefoonverificatiecode",
      newPhonePlaceholder: "Voer een telefoonnummer in, bijvoorbeeld 13800138000",
      smsCode: "SMS-verificatiecode",
      smsCodePlaceholder: "Voer de 6-cijferige SMS-code in",
      safeEmail: "Veilige e-mail",
      safeEmailDesc: "Primaire referentie die wordt gebruikt om in te loggen",
      editEmailTitle: "Veilige e-mail wijzigen",
      newEmail: "Nieuwe e-mail",
      newEmailPlaceholder: "Voer het nieuwe e-mailadres in",
      emailCode: "E-mailcode",
      emailCodePlaceholder: "Voer de 6-cijferige code in",
      changeEmailHint:
        "De nieuwe e-mail moet worden geverifieerd voordat de wijziging wordt opgeslagen.",
      changePassword: "Wachtwoord wijzigen",
      changePasswordDesc:
        "Werk uw inlogwachtwoord regelmatig bij om de accountbeveiliging te verbeteren",
      editPasswordTitle: "Inlogwachtwoord wijzigen",
      currentPassword: "Huidig wachtwoord",
      currentPasswordPlaceholder: "Voer uw huidige wachtwoord in",
      currentPasswordIncorrect: "Het huidige wachtwoord is onjuist",
      newPassword: "Nieuw wachtwoord",
      newPasswordPlaceholder: "Voer een nieuw wachtwoord in van minimaal 8 tekens",
      confirmPassword: "Bevestig nieuw wachtwoord",
      confirmPasswordPlaceholder: "Voer het nieuwe wachtwoord opnieuw in",
      changePasswordHint:
        "Gebruik het nieuwe wachtwoord de volgende keer dat u inlogt, en vermijd het hergebruik van het oude wachtwoord.",
      passwordMinLength: "Wachtwoord moet minimaal 8 tekens lang zijn",
      passwordMismatch: "De twee nieuwe wachtwoorden komen niet overeen",
      passwordUpdated: "Wachtwoord bijgewerkt",
      passwordUpdateFailed: "Bijwerken van wachtwoord mislukt",
      mfa: "Tweefactorauthenticatie",
      mfaDesc: "Wanneer ingeschakeld, is extra verificatie vereist tijdens het inloggen",
      mfaTitle: "Tweefactorauthenticatie configureren",
      mfaHint: "Kies de tweede verificatiemethode die tijdens het inloggen wordt gebruikt.",
      mfaTitleEnable: "Tweefactorauthenticatie inschakelen",
      mfaTitleDisable: "Tweefactorauthenticatie uitschakelen",
      mfaHintEnable:
        "Kies de tweede verificatiemethode die tijdens het inloggen wordt gebruikt.",
      mfaHintDisable:
        "Na uitschakelen is extra verificatie tijdens het inloggen niet langer vereist.",
      mfaMethod: "Verificatiemethode",
      mfaMethodEmail: "E-mailcode",
      mfaMethodSMS: "Telefooncode",
      passkeys: "Passkeys",
      passkeysDesc:
        "Na het binden kunt u direct inloggen vanuit de systeem-passkey-selector.",
      addPasskey: "Passkey toevoegen",
      deletePasskey: "Passkey verwijderen",
      passkeyName: "Apparaatnaam",
      passkeyNamePlaceholder: "Voer een herkenbare naam in",
      passkeyLastUsed: "Laatst gebruikt",
      passkeyLastUsedIP: "Laatst gebruikte IP",
      passkeyCreatedAt: "Gemaakt op",
      passkeyEmpty: "Geen passkeys gebonden",
      passkeyManageVerify:
        "Om uw account te beschermen, verifieer uw huidige referenties voordat u een passkey toevoegt of verwijdert.",
      currentMfaCode: "Huidige MFA-code",
      currentMfaCodePlaceholder: "Voer de code in van de huidige MFA-methode",
      currentMfaCodeHintEmail:
        "Voltooi verificatie met de momenteel gebonden e-mailcode voordat u opslaat.",
      currentMfaCodeHintSMS:
        "Voltooi verificatie met de momenteel gebonden telefooncode voordat u opslaat.",
      currentMfaCodeHintManual:
        "Voer de momenteel geconfigureerde handmatige MFA-code in voordat u opslaat.",
      accountSecurity: "Accountbeveiliging",
      recentLogin: "Recente inlog",
      recentLoginDesc: "Laatste succesvolle inlogtijd en apparaat-IP",
    },
    profile: {
      title: "Profiel",
      avatar: "Avatar",
      avatarDesc:
        "De afbeelding wordt automatisch gecropd in het midden en geconverteerd naar webp",
      nickname: "Bijnaam",
      nicknameDesc: "Huidige weergavenaam",
      gender: "Geslacht",
      genderDesc: "Profielgeslachtsinformatie voor dit account",
      languagePreference: "Taalvoorkeur",
      languagePreferenceDesc:
        "Na inloggen wordt deze taal als eerste gebruikt voor paginainhoud",
      languagePreferenceSaved: "Taalvoorkeur opgeslagen",
      languagePreferenceSaveFailed: "Opslaan van taalvoorkeur mislukt",
      genderMale: "Man",
      genderFemale: "Vrouw",
      genderOther: "Anders",
      userId: "Gebruikers-ID",
      userIdDesc: "Unieke identifier van het huidige account in het systeem",
      nicknamePlaceholder: "Voer bijnaam in",
      editNicknameTitle: "Bijnaam bewerken",
      editGenderTitle: "Geslacht bewerken",
      email: "E-mailadres",
      emailDesc: "Gebruikt voor inloggen, verificatie en beveiligingsmeldingen",
      createdAt: "Geregistreerd op",
      createdAtDesc: "De tijd waarop dit account is aangemaakt",
      country: "Registratieland",
      countryDesc: "Land of regio geregistreerd bij registratie",
    },
    privacy: {
      title: "Privacycentrum",
      exportTitle: "Gebruikersgegevens downloaden",
      exportDesc:
        "Exporteer profielgegevens en niet-ingetrokken geautoriseerde apps in CSV-formaat.",
      exportAction: "Gegevens downloaden",
      exportPasswordVerifyDesc:
        "Verifieer uw huidige inlogwachtwoord voordat u downloadt. De CSV bevat profielgegevens en niet-ingetrokken geautoriseerde apps.",
      exportSuccess: "Downloaden van gebruikersgegevens gestart",
      exportFailed: "Exporteren van gebruikersgegevens mislukt",
      minimizeTitle: "Dataminimalisatie",
      minimizeDesc:
        "Het systeem bewaart alleen het registratieland, e-mail, toestemmingen en essentiële inlogbeveiligingsgegevens.",
      scopeTitle: "Huidig toegangsbereik",
      scopeDesc:
        "U kunt apps die toegang hebben gekregen tot uw account in Geautoriseerde apps controleren en deze op elk moment intrekken.",
      statusTitle: "Accountstatus",
      statusDesc:
        "Als het account is bevroren, wordt inloggen geblokkeerd totdat een beheerder het oplost.",
      deleteTitle: "Account verwijderen",
      deleteDesc:
        "Als u binnen 7 dagen opnieuw inlogt, wordt het verwijderingsverzoek automatisch geannuleerd. Anders worden het account en de toestemmingsgegevens verwijderd.",
      deleteWarningPrimary:
        "Het verwijderen van het account is onomkeerbaar. Back-up gegevens die aan dit account zijn gerelateerd voordat u doorgaat.",
      deleteWarningSecondary:
        "Na het indienen van het verzoek, annuleert opnieuw inloggen binnen 7 dagen de verwijdering. Als u binnen 7 dagen niet inlogt, verwijdert het systeem het account en de toestemmingsgegevens automatisch.",
      deleteAction: "Ik heb gelezen en ga akkoord met de gevolgen",
      passwordVerifyTitle: "Huidig wachtwoord verifiëren",
      passwordVerifyDesc:
        "Voer uw huidige inlogwachtwoord in en voltooi e-mailverificatie. Als een telefoonnummer is gebonden, is ook telefoonverificatie vereist.",
      emailVerifyCode: "E-mailverificatiecode",
      emailVerifyCodePlaceholder: "Voer de 6-cijferige code in die naar uw e-mail is verzonden",
      sendDeleteEmailCode: "E-mailcode verzenden",
      sendDeleteEmailCodeSuccess:
        "De e-mailverificatiecode is verzonden. Controleer uw inbox.",
      sendDeleteEmailCodeFailed: "Verzenden van de e-mailverificatiecode mislukt",
      phoneVerifyCode: "Telefoonverificatiecode",
      phoneVerifyCodePlaceholder: "Voer de 6-cijferige code in die naar uw telefoon is verzonden",
      sendDeletePhoneCode: "Telefooncode verzenden",
      sendDeletePhoneCodeSuccess:
        "De telefoonverificatiecode is verzonden. Controleer uw telefoon.",
      sendDeletePhoneCodeFailed: "Verzenden van de telefoonverificatiecode mislukt",
      confirmDeleteNow: "Verwijderingsverzoek indienen",
      deleteSuccess:
        "Verwijderingsverzoek ingediend. Inloggen binnen 7 dagen annuleert het.",
      deleteFailed: "Indienen van verwijderingsverzoek mislukt",
      deletePendingAt:
        "Verwijderingsverzoek ingediend. Geplande verwijderingstijd: {{date}}",
    },
    bindings: {
      title: "Geautoriseerde apps",
      appId: "App-naam",
      scopes: "Scopes",
      createdAt: "Geautoriseerd op",
      authorizedAt: "Geautoriseerd op",
      action: "Actie",
      viewDetails: "Details",
      detailTitle: "Autorisatiedetails",
      siteName: "Geautoriseerd site",
      requestedPermissions: "Verleende machtigingen",
      scopeOpenIdTitle: "Bevestig uw identiteit",
      scopeOpenIdDesc:
        "Gebruikt om te bevestigen dat het ingelogde account echt u is en om de basisinlogsessie op te zetten.",
      scopeProfileTitle: "Toegang tot uw publieke profiel",
      scopeProfileDesc:
        "Inclusief bijnaam, avatar en andere publieke profielgegevens voor weergave in de app.",
      scopeEmailTitle: "Toegang tot uw e-mailadres",
      scopeEmailDesc:
        "Gebruikt om uw account-e-mail weer te geven of berichten te sturen en uw account te binden wanneer nodig.",
      scopePhoneTitle: "Toegang tot uw telefoonnummer",
      scopePhoneDesc:
        "Gebruikt voor accountidentificatie, meldingen of beveiligingsverificatie wanneer nodig.",
      scopeGatewayReadTitle: "Toegang tot beveiligde zakelijke API's",
      scopeGatewayReadDesc:
        "Staat de app toe om na autorisatie beveiligde API-bronnen namens u te benaderen.",
      scopeCustomTitle: "Gevraagde machtiging: {{scope}}",
      scopeCustomDesc:
        "Deze app vraagt een extra zakelijke machtiging aan. Beoordeel het zorgvuldig voordat u doorgaat.",
      revoke: "Intrekken",
      batchRevoke: "Batch intrekken",
      batchRevokeConfirmTitle: "Batchintrekken bevestigen?",
      batchRevokeConfirmDesc:
        "{{count}} autorisaties zijn geselecteerd. Deze apps moeten opnieuw toestemming vragen.",
    },
    help: {
      title: "Helpcentrum",
      loginIssueTitle: "Kan niet inloggen",
      loginIssueDesc:
        "Als u niet kunt inloggen, controleer dan eerst of u de juiste methode voor het account gebruikt, zoals wachtwoord, e-mailcode, telefooncode of passkey. Als een verificatiecode wordt afgewezen, zorg ervoor dat het de laatste is en nog binnen zijn geldigheidsperiode ligt. Als het account als bevroren, in afwachting van activatie of op andere manier beperkt wordt weergegeven, moet het probleem worden opgelost door een platformbeheerder. Als u onlangs een accountverwijderingsverzoek hebt ingediend, kan het systeem ook verwijderingsbevestiging of telefoonbinding vereisen voordat toegang wordt hersteld.",
      protectTitle: "Uw account beschermen",
      protectDesc:
        "Schakel zo snel mogelijk tweefactorauthenticatie in en bind passkeys op vertrouwde apparaten om het risico van wachtwoord-only-compromis te verminderen. Deel nooit e-mailcodes, SMS-codes of MFA-codes met derden, en voer referenties niet opnieuw in op pagina's die u niet vertrouwt. Als u hetzelfde account op meerdere apparaten gebruikt, controleer dan regelmatig recente inloggen, gebonden passkeys en geautoriseerde apps, en verwijder apparaten of autorisaties die u niet langer gebruikt.",
      authIssueTitle: "Autorisatieproblemen",
      authIssueDesc:
        "Als een app onbekend lijkt, ongebruikelijke scopes vraagt of u vermoedt dat deze uw account misbruikt, open Geautoriseerde apps om de autorisatietijd, verleende scopes en integratiedetails te controleren, en intrekkingsindien nodig onmiddellijk. Na intrekking kan de app uw account niet langer gebruiken om beveiligde bronnen te benaderen totdat u opnieuw inlogt en een nieuwe toestemmingsaanvraag goedkeurt. Als het probleem mogelijk het hele account in plaats van een enkele app beïnvloedt, moet u ook uw wachtwoord wijzigen, uw MFA-instellingen verifiëren en recente inlog- en passkey-activiteit controleren.",
      contactTitle: "Neem contact met ons op",
      contactDesc:
        "Als u handmatige ondersteuning nodig heeft, kunt u contact opnemen met het platformondersteuningscontact hieronder. Bij het melden van een probleem, voeg het account-e-mail, de tijd waarop het probleem zich voordeed, schermafbeeldingen van foutberichten, de inlogmethode die u gebruikte en relevante apparaat- of browserdetails toe, zodat het probleem sneller kan worden onderzocht.",
      contactMainlandTitle: "Hoofdland China",
      contactOverseasTitle: "Buitenland",
      contactPersonLabel: "Contactpersoon:",
      contactPhoneLabel: "Telefoon:",
      contactEmailLabel: "E-mail:",
      contactHoursLabel: "Ondersteuningsuren:",
      contactMainlandPersonValue: "YOUR_NAME",
      contactMainlandPhoneValue: "YOUR_PHONE_NUMBER",
      contactMainlandEmailValue: "YOUR_EMAIL",
      contactMainlandHoursValue: "Maandag tot vrijdag 09:00 - 18:00",
      contactOverseasPersonValue: "Wordt geleverd",
      contactOverseasPhoneValue: "Wordt geleverd",
      contactOverseasEmailValue: "Wordt geleverd",
      contactOverseasHoursValue: "Maandag tot vrijdag 09:00 - 18:00",
      contactRegionNotice:
        "Neem contact op met het ondersteuningskanaal voor uw regio eerst. Als u niet zeker weet welke regio van toepassing is, start met het Hoofdland China-contact voor routeringshulp.",
      contactNotice:
        "Voor problemen zoals bevroren accounts, abnormale autorisaties, verloren passkeys of verwijderingsherstel, neem eerst contact op met de beheerder via het bovenstaande telefoonnummer of e-mail. Als uw platform een officieel ticketingsysteem, aankondigingsbord of operationsgroep biedt, volg dan eerst dat officiële kanaal.",
    },
  },
} as const;

export default locale;
