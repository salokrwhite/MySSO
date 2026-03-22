const locale = {
  translation: {
    header: {
      language: "Język",
      languageModalTitle: "Wybierz język",
      languageModalDesc: "Wybierz język interfejsu, którego chcesz używać.",
      agreement: "Umowa użytkownika",
      privacy: "Polityka prywatności",
      help: "Centrum pomocy",
      logout: "Wyloguj się",
      accountCenter: "Centrum konta",
    },
    legal: {
      back: "Wróć do strony głównej",
      updatedAt: "Ostatnia aktualizacja: {{date}}",
      agreement: {
        title: "Umowa użytkownika",
        updatedAt: "2026-03-16",
        intro:
          "Witamy w {{siteName}}. Przed rejestracją, logowaniem, integracją lub korzystaniem z usług ujednoliconej tożsamości, prosimy o uważne przeczytanie tej umowy. Kontynuowanie korzystania z usługi oznacza zgodę na wiążące warunki tej umowy.",
        sections: {
          accountTitle: "1. Konto i logowanie",
          accountP1:
            "Musisz podać prawdziwe, zgodne z prawem i możliwe do zweryfikowania dane rejestracyjne oraz prawidłowo zabezpieczyć swoje konto, hasło, kody weryfikacyjne i inne dane uwierzytelniające. Ponosisz odpowiedzialność za straty spowodowane nieprawidłowym zarządzaniem danymi uwierzytelniającymi po Twojej stronie.",
          accountP2:
            "W przypadku wykrycia nietypowej aktywności logowania, naruszenia zasad, zablokowanego statusu lub zagrożeń bezpieczeństwa, platforma może wymagać dodatkowej weryfikacji, ograniczyć logowanie lub zawiesić dostęp ze względów bezpieczeństwa.",
          acceptableUseTitle: "2. Akceptowalne użycie",
          acceptableUseP1:
            "Nie możesz używać tego systemu do żadnej nielegalnej działalności, naruszania praw, nadużywania interfejsów uwierzytelniania, masowych żądań, ataków słownikowych ani żadnego zachowania zagrażającego stabilności platformy lub obchodzącego kontrole bezpieczeństwa.",
          acceptableUseP2:
            "W przypadku naruszenia tej umowy lub powiązanych zasad, platforma może zawiesić lub zakończyć część lub cały dostęp i zastrzega sobie prawo do dochodzenia odpowiedzialności, gdy jest to konieczne.",
          authorizationTitle: "3. Autoryzacja i aplikacje stron trzecich",
          authorizationP1:
            "Gdy używasz konta {{siteName}} do logowania się do aplikacji stron trzecich, system poprosi o Twoją zgodę na podstawie uprawnień pokazanych na stronie autoryzacji. Możesz odmówić lub cofnąć tę zgodę w dowolnym momencie w centrum konta.",
          authorizationP2:
            "Wszelkie wykorzystanie Twoich danych przez aplikację strony trzeciej po autoryzacji jest regulowane przez własne warunki usługi i politykę prywatności tej aplikacji. Platforma ponosi odpowiedzialność tylko w zakresie wymaganym przez prawo.",
          developerTitle: "4. Integracja dla deweloperów",
          developerP1:
            "Deweloperzy muszą zapewnić, że informacje o aplikacji, adresy przekierowania, żądane zakresy i cele biznesowe są prawdziwe, kompletne i stale ważne, oraz nie mogą wprowadzać użytkowników w błąd.",
          developerP2:
            "Platforma może przeglądać, odrzucać, usuwać z listy, usuwać lub ograniczać połączone aplikacje, aby zachować bezpieczeństwo i integralność ekosystemu ujednoliconej tożsamości.",
          liabilityTitle: "5. Zmiany usług i ograniczenie odpowiedzialności",
          liabilityP1:
            "Ze względów bezpieczeństwa, zgodności, operacji lub konserwacji platforma może dostosowywać, aktualizować, zawieszać lub kończyć niektóre interfejsy, procesy lub funkcje, starając się zapewnić powiadomienia, gdy jest to odpowiednie.",
          liabilityP2:
            "W zakresie dozwolonym przez prawo, platforma nie ponosi odpowiedzialności wykraczającej poza obowiązki ustawowe za przerwy, nieprawidłowe dane lub straty spowodowane siłą wyższą, awariami sieci, przyczynami stron trzecich lub nieprawidłowym użyciem po Twojej stronie.",
        },
      },
      privacy: {
        title: "Polityka prywatności",
        updatedAt: "2026-03-16",
        intro:
          "{{siteName}} ceni Twoje dane osobowe i bezpieczeństwo konta. Niniejsza polityka wyjaśnia, jak zbieramy, używamy, przechowujemy, udostępniamy i chronimy Twoje informacje oraz jakie przysługują Ci prawa.",
        sections: {
          dataCollectionTitle: "1. Informacje, które zbieramy",
          dataCollectionP1:
            "Podczas rejestracji, logowania lub korzystania z usług konta możemy zbierać kraj rejestracji, adres e-mail, numer telefonu, hash hasła, sesje logowania, IP urządzenia, rekordy autoryzacji i niezbędne logi bezpieczeństwa.",
          dataCollectionP2:
            "Gdy przesyłasz awatar, zmieniasz swój profil, wiążesz numer telefonu, włączasz MFA lub autoryzujesz aplikację strony trzeciej, przetwarzamy informacje, które przesyłasz, zgodnie z potrzebami dostarczenia tej funkcji.",
          dataUsageTitle: "2. Jak używamy informacji",
          dataUsageP1:
            "Używamy odpowiednich informacji do rejestracji konta, uwierzytelniania logowania, dostarczania kodów weryfikacyjnych, kontroli ryzyka, potwierdzania autoryzacji, przeglądu aplikacji deweloperskich, powiadomień o bezpieczeństwie konta i utrzymania niezawodności usługi.",
          dataUsageP2:
            "Analizujemy również logi i statystyki na zasadzie minimalnej konieczności, aby wykrywać nietypową aktywność, poprawiać doświadczenie produktu i wzmacniać bezpieczeństwo.",
          dataSharingTitle: "3. Udostępnianie i ujawnianie",
          dataSharingP1:
            "Udostępniamy informacje identyfikacyjne lub dane związane z zakresem pokazanym na stronie autoryzacji aplikacjom stron trzecich tylko wtedy, gdy wyraźnie udzielisz na to zgody.",
          dataSharingP2:
            "Z wyjątkiem wymogów prawnych, żądań regulacyjnych, ochrony interesu publicznego lub potrzeb bezpieczeństwa systemu, nie sprzedajemy ani nie udostępniamy niezgodnie z prawem Twoich danych osobowych niepowiązanym stronom trzecim.",
          userRightsTitle: "4. Twoje prawa",
          userRightsP1:
            "Możesz przeglądać i aktualizować swój profil, powiązania, rekordy autoryzacji i ustawienia bezpieczeństwa w centrum konta, a także możesz cofnąć zgody aplikacji lub złożyć wniosek o usunięcie konta.",
          userRightsP2:
            "Jeśli uważasz, że Twoje informacje są nieprawidłowe, przetwarzane nieprawidłowo lub wykorzystywane poza koniecznością, możesz skontaktować się z operatorem platformy lub wykonywać swoje prawa na podstawie obowiązującego prawa.",
          securityTitle: "5. Ochrona i przechowywanie",
          securityP1:
            "Stosujemy kontrole dostępu, hashowanie haseł, ważność kodów weryfikacyjnych, logi audytu i minimalizację danych, aby chronić Twoje dane osobowe i dane uwierzytelniające.",
          securityP2:
            "Z zastrzeżeniem wymogów prawnych i biznesowych, przechowujemy Twoje informacje tylko tak długo, jak jest to konieczne do realizacji celów usługi; po usunięciu konta lub wygaśnięciu okresów przechowywania, usuniemy lub zanonimizujemy dane zgodnie z polityką.",
        },
      },
    },
    auth: {
      noAccount: "Nie masz konta?",
      registerNow: "Zarejestruj się teraz",
      registerPageTitle: "Utwórz konto",
      registerPageSubtitle:
        "Ukończ rejestrację podając kraj, adres e-mail i kod weryfikacyjny e-mail.",
      registerDisabled: "Rejestracja jest obecnie wyłączona",
      registerSuccess:
        "Rejestracja zakończona sukcesem. Zaloguj się używając hasła.",
      phoneBindingRequiredAfterRegister:
        "Rejestracja zakończona sukcesem. Najpierw powiąż numer telefonu, aby aktywować konto.",
      registerFailed: "Rejestracja nie powiodła się",
      country: "Kraj",
      countryRequired: "Wybierz kraj",
      registerCode: "Kod e-mail",
      registerCodeRequired: "Wprowadź kod weryfikacyjny e-mail",
      registerCodePlaceholder: "Wprowadź 6-cyfrowy kod",
      sendRegisterCode: "Wyślij kod",
      sendRegisterCodeSuccess:
        "Kod weryfikacyjny został wysłany. Sprawdź swoją skrzynkę odbiorczą.",
      sendRegisterCodeFailed: "Nie udało się wysłać kodu weryfikacyjnego",
      backToLoginWithAccount: "Masz już konto? Zaloguj się",
      forgotPassword: "Zapomniałeś hasła?",
      forgotPasswordPageTitle: "Zresetuj hasło",
      forgotPasswordPageSubtitle:
        "Zresetuj hasło logowania używając zarejestrowanego adresu e-mail i kodu weryfikacyjnego.",
      forgotPasswordPrompt: "Zapomniałeś hasła?",
      forgotPasswordAction: "Odzyskaj je",
      forgotPasswordDesc:
        "Po zweryfikowaniu adresu e-mail kodem, możesz bezpośrednio ustawić nowe hasło logowania.",
      forgotPasswordHint:
        "Wprowadź zarejestrowany adres e-mail, kod weryfikacyjny i nowe hasło. Po zatwierdzeniu możesz natychmiast zalogować się nowym hasłem.",
      goToOtpLogin: "Użyj logowania kodem e-mail",
      resetCode: "Kod odzyskiwania",
      sendResetCode: "Wyślij kod odzyskiwania",
      sendResetCodeSuccess:
        "Kod odzyskiwania został wysłany. Sprawdź swoją skrzynkę odbiorczą.",
      sendResetCodeFailed: "Nie udało się wysłać kodu odzyskiwania",
      resetPassword: "Zresetuj hasło",
      resetPasswordSuccess:
        "Hasło zresetowane pomyślnie. Zaloguj się używając nowego hasła.",
      resetPasswordFailed: "Nie udało się zresetować hasła",
      newPassword: "Nowe hasło",
      confirmNewPassword: "Potwierdź nowe hasło",
      newPasswordPlaceholder: "Wprowadź hasło z co najmniej 8 znakami",
      confirmPassword: "Potwierdź hasło",
      confirmPasswordPlaceholder: "Wprowadź hasło ponownie",
      backToLogin: "Wróć do logowania",
      emailRequired: "Wprowadź adres e-mail",
      passwordRequired: "Wprowadź hasło",
      otpCodeRequired: "Wprowadź kod weryfikacyjny e-mail",
      phoneRequired: "Wprowadź numer telefonu",
      phoneOtpCodeRequired: "Wprowadź kod weryfikacyjny SMS",
      emailInvalid: "Wprowadź prawidłowy adres e-mail",
      resetCodeRequired: "Wprowadź kod odzyskiwania",
      resetCodePlaceholder: "Wprowadź 6-cyfrowy kod odzyskiwania",
      newPasswordRequired: "Wprowadź nowe hasło",
      confirmNewPasswordRequired: "Potwierdź nowe hasło ponownie",
      newPasswordMinLength: "Nowe hasło musi mieć co najmniej 8 znaków",
      passwordMinLength: "Hasło musi mieć co najmniej 8 znaków",
      newPasswordMismatch: "Dwa nowe hasła nie pasują do siebie",
      passwordMismatch: "Dwa hasła nie pasują do siebie",
      registrationClosed: "Rejestracja jest obecnie zamknięta",
      login: "Zaloguj się",
      passkeyLogin: "Passkey",
      passkeyLoginDesc:
        "Użyj passkey już powiązanego z tą witryną na swoim urządzeniu lub koncie systemowym.",
      passkeyLoginButton: "Użyj passkey",
      passkeyLoginHint:
        "Musisz powiązać passkey w centrum konta przed użyciem go tutaj.",
      passkeyLoginSuccess: "Passkey dodany pomyślnie",
      passkeyNotAvailable:
        "Brak dostępnego passkey dla tej witryny na tym urządzeniu. Użyj innej metody logowania.",
      passwordLogin: "Hasło",
      otpLogin: "Kod e-mail",
      phoneOtpLogin: "Kod telefonu",
      email: "E-mail",
      phone: "Numer telefonu",
      password: "Hasło",
      otpCode: "Kod e-mail",
      phoneOtpCode: "Kod SMS",
      mfaCode: "Kod 2FA",
      mfaPlaceholder: "Pozostaw puste, jeśli uwierzytelnianie dwuskładnikowe nie jest włączone",
      sendOtpCode: "Wyślij kod e-mail",
      sendOtpCodeSuccess:
        "Kod e-mail został wysłany. Sprawdź swoją skrzynkę odbiorczą.",
      sendOtpCodeFailed: "Nie udało się wysłać kodu weryfikacyjnego",
      sendOtpCodeEmailRequired: "Wprowadź adres e-mail przed żądaniem kodu",
      sendPhoneOtpCode: "Wyślij kod SMS",
      sendPhoneOtpCodeSuccess:
        "Kod SMS został wysłany. Sprawdź swój telefon.",
      sendPhoneOtpCodeFailed: "Nie udało się wysłać kodu SMS",
      sendPhoneBindingCode: "Wyślij kod powiązania",
      sendPhoneBindingCodeSuccess:
        "Kod powiązania telefonu został wysłany. Sprawdź swój telefon.",
      sendPhoneBindingCodeFailed: "Nie udało się wysłać kodu powiązania telefonu",
      securityCaptcha: "Weryfikacja bezpieczeństwa",
      securityCaptchaPlaceholder:
        "Wprowadź wartość weryfikacji bezpieczeństwa i spróbuj ponownie",
      securityCaptchaHelp:
        "Gdy bieżące urządzenie lub IP wysyła zbyt wiele żądań, ukończ tę weryfikację bezpieczeństwa przed żądaniem kolejnego kodu.",
      securityCaptchaRequiredTip:
        "Wolumen żądań jest wysoki. Ukończ weryfikację bezpieczeństwa przed żądaniem kolejnego kodu.",
      sendOtpCodePhoneRequired: "Wprowadź numer telefonu przed żądaniem kodu",
      phoneBindingPageTitle: "Powiąż numer telefonu",
      phoneBindingRegisterDesc:
        "To konto spełniło regułę ryzyka po rejestracji. Powiąż numer telefonu przed kontynuowaniem.",
      phoneBindingLoginDesc:
        "To konto spełniło regułę ryzyka logowania. Powiąż numer telefonu przed kontynuowaniem.",
      completePhoneBinding: "Powiąż i kontynuuj",
      phoneBindingSuccess:
        "Numer telefonu powiązany pomyślnie. Konto jest aktywne ponownie.",
      mfaVerifyTitle: "Weryfikacja dwuskładnikowa",
      mfaVerifyEmailHint:
        "Kod weryfikacyjny został wysłany do {{target}}. Wprowadź go, aby kontynuować logowanie.",
      mfaVerifyPhoneHint:
        "Kod weryfikacyjny został wysłany do {{target}}. Wprowadź go, aby kontynuować logowanie.",
      loginStepUpTitle: "Dodatkowa weryfikacja logowania",
      loginStepUpEmailDesc:
        "To logowanie wymaga dodatkowej weryfikacji e-mail. Kod zostanie wysłany do {{email}}.",
      loginStepUpSMSDesc:
        "To logowanie wymaga dodatkowej weryfikacji telefonu. Kod zostanie wysłany do {{phone}}.",
      loginStepUpDualDesc:
        "To logowanie wymaga weryfikacji zarówno e-mail, jak i telefonu. E-mail: {{email}}, telefon: {{phone}}.",
      loginStepUpExpired:
        "Sesja dodatkowej weryfikacji logowania wygasła. Zaloguj się ponownie.",
      forcedMfaEnrollmentTitle: "Uwierzytelnianie dwuskładnikowe musi być włączone",
      forcedMfaEnrollmentDesc:
        "Administrator wymaga, aby to konto włączyło uwierzytelnianie dwuskładnikowe przed zakończeniem tego logowania.",
      forcedMfaEnrollmentExpired:
        "Sesja wymuszonego rejestracji MFA wygasła. Zaloguj się ponownie.",
      completeForcedMfaEnrollment: "Włącz i kontynuuj",
      cancelForcedMfaEnrollment: "Anuluj i wróć do logowania",
      verifyAndLogin: "Zweryfikuj i zaloguj się",
      deletionConfirmTitle: "Wniosek o usunięcie konta złożony",
      deletionConfirmScheduledAt: "Zaplanowany czas usunięcia: {{date}}",
      deletionConfirmDesc:
        "Ponowne zalogowanie się spowoduje anulowanie usunięcia.",
      deletionConfirmContinue: "Kontynuuj i anuluj usunięcie",
      deletionConfirmExpired: "Potwierdzenie wygasło, zaloguj się ponownie",
      deletionConfirmFailed: "Potwierdzenie nie powiodło się, zaloguj się ponownie",
      logoutProgressTitle: "Wylogowywanie",
      logoutProgressDesc:
        "Sesja tożsamości została wyczyszczona, a połączone aplikacje są wylogowywane.",
      loginFailed: "Logowanie nie powiodło się",
      oidcCallbackFailed: "Wywołanie zwrotne OIDC nie powiodło się",
      appRejected: "Aplikacja odrzucona",
      appRejectedWithReason: "Aplikacja odrzucona: {{reason}}",
      appNotFound: "Nie znaleziono aplikacji",
      accessDenied: "Dostęp odmówiony",
      tokenExchangeFailed: "Wymiana tokena nie powiodła się",
      authorize: {
        title: "Użyj {{siteName}} do zalogowania się do {{appName}}",
        desc: "Ta aplikacja żąda następujących informacji i uprawnień. Po potwierdzeniu wrócisz do aplikacji biznesowej, aby ukończyć logowanie.",
        chooseAccountTitle: "Jesteś już zalogowany do {{siteName}}",
        chooseAccountDesc:
          "Wybierz, czy chcesz kontynuować z bieżącym kontem, czy najpierw zalogować się innym kontem.",
        currentAccountFallback: "Bieżące konto",
        useCurrentAccount: "Kontynuuj z tym kontem",
        useAnotherAccount: "Zaloguj się innym kontem",
        permissionTitle: "Żądane uprawnienia",
        permissionCount: "{{count}} elementów",
        agreement:
          "Przeczytałem i zgadzam się udzielić uprawnień wymienionych powyżej",
        confirm: "Potwierdź i kontynuuj",
        cancel: "Anuluj i wróć do logowania",
        scopes: {
          openidTitle: "Potwierdź swoją tożsamość",
          openidDesc:
            "Służy do potwierdzenia, że bieżące zalogowane konto należy do Ciebie i ustanowienia podstawowej sesji logowania.",
          profileTitle: "Uzyskaj dostęp do swojego publicznego profilu",
          profileDesc:
            "Obejmuje nazwę wyświetlaną, awatar i inne publiczne dane profilu do wyświetlania w aplikacji.",
          emailTitle: "Uzyskaj dostęp do swoich informacji e-mail",
          emailDesc:
            "Służy do wyświetlania adresu e-mail konta lub wspierania powiadomień i łączenia konta, gdy jest to potrzebne.",
          phoneTitle: "Uzyskaj dostęp do swojego numeru telefonu",
          phoneDesc:
            "Służy do identyfikacji konta, powiadomień lub weryfikacji bezpieczeństwa, gdy jest to potrzebne.",
          gatewayReadTitle: "Uzyskaj dostęp do chronionych interfejsów API biznesowych",
          gatewayReadDesc:
            "Umożliwia aplikacji dostęp do chronionych zasobów jako Twoja autoryzowana tożsamość.",
          customTitle: "Żądanie uprawnienia: {{scope}}",
          customDesc:
            "Ta aplikacja żąda dodatkowego uprawnienia biznesowego. Przejrzyj je uważnie przed kontynuowaniem.",
        },
      },
      sessionConflict: {
        title: "Wykryto różne konta w tej przeglądarce",
        desc: "Konto zapamiętane przez to okno nie zgadza się z aktualnie aktywnym kontem przeglądarki. Tylko jedno konto główne może pozostać aktywne w tej samej przeglądarce w tym samym czasie. Wybierz, z którym kontem chcesz kontynuować.",
        browserAccount: "Aktywne konto przeglądarki",
        thisWindowAccount: "Poprzednie konto tego okna",
        useBrowserAccount: "Użyj aktywnego konta przeglądarki",
        useThisWindowAccount: "Wróć do konta tego okna",
        relogin: "Wyloguj się i zaloguj ponownie",
      },
    },
    nav: {
      security: "Logowanie i bezpieczeństwo",
      profile: "Profil",
      privacy: "Centrum prywatności",
      bindings: "Autoryzowane aplikacje",
      help: "Centrum pomocy",
    },
    common: {
      loadingFailed: "Nie udało się załadować",
      revokeFailed: "Nie udało się cofnąć zgody",
      revokeSuccess: "Zgoda cofnięta",
      confirm: "Potwierdź",
      sendCode: "Wyślij kod",
      sendCodeSuccess: "Kod weryfikacyjny wysłany pomyślnie",
      sendingCode: "Wysyłanie",
      save: "Zapisz",
      saving: "Zapisywanie",
      edit: "Edytuj",
      cancel: "Anuluj",
      uploadAvatar: "Prześlij awatar",
      avatarUpdated: "Awatar zaktualizowany",
      avatarUploadFailed: "Nie udało się przesłać awatara",
      profileUpdated: "Profil zaktualizowany",
      profileUpdateFailed: "Nie udało się zaktualizować profilu",
      imageReadFailed: "Nie udało się odczytać obrazu",
      imageProcessUnsupported:
        "Przetwarzanie obrazu nie jest obsługiwane w tej przeglądarce",
      avatarConvertFailed: "Nie udało się przekonwertować awatara",
      unset: "Nie ustawione",
      unsetShort: "Nie ustawione",
      notFilled: "Nie podano",
      noRecord: "Brak rekordów",
      normal: "Aktywne",
      accountCenter: "Centrum konta",
      noAuthorizedApps: "Brak autoryzowanych aplikacji",
    },
    errors: {
      emailRequiredByServer: "Wprowadź adres e-mail",
      passwordRequiredByServer: "Wprowadź hasło",
      invalidCredentials: "Nieprawidłowe konto lub dane uwierzytelniające",
      invalidOtpCode: "Kod weryfikacyjny jest nieprawidłowy lub wygasł",
      accountFrozen: "To konto zostało zablokowane",
      accountFrozenWithReason:
        "To konto zostało zablokowane. Powód: {{reason}}",
      userNotFound: "Nie znaleziono użytkownika",
      smsNotConfigured: "Wysyłanie SMS nie jest skonfigurowane",
      smtpNotConfigured: "Wysyłanie e-mail nie jest skonfigurowane",
      userStatusInvalid:
        "Bieżący status konta nie zezwala na tę akcję",
      invalidCurrentPhoneVerificationCode:
        "Bieżący kod weryfikacyjny telefonu jest nieprawidłowy lub wygasł",
      invalidNewPhoneVerificationCode:
        "Nowy kod weryfikacyjny telefonu jest nieprawidłowy lub wygasł",
      currentPhoneVerificationCodeRequired:
        "Wprowadź bieżący kod weryfikacyjny telefonu",
      currentPhoneNotBound:
        "Żaden numer telefonu nie jest obecnie powiązany z tym kontem",
      phoneDoesNotMatchCurrentBoundPhone:
        "Numer telefonu nie zgadza się z aktualnie powiązanym",
      phoneAlreadyBound: "Ten numer telefonu jest już powiązany",
      newPhoneMustBeDifferent:
        "Nowy numer telefonu musi być inny niż bieżący",
      phoneAndVerificationCodeRequired:
        "Wprowadź numer telefonu i nowy kod weryfikacyjny telefonu",
      invalidMfaCode: "Kod weryfikacji dwuskładnikowej jest nieprawidłowy lub wygasł",
      unsupportedMfaMethod: "Nieobsługiwana metoda uwierzytelniania dwuskładnikowego",
      mfaNotEnabled:
        "Uwierzytelnianie dwuskładnikowe nie jest włączone dla tego konta",
      emailNotBound: "Żaden adres e-mail nie jest powiązany z tym kontem",
      phoneNotBound: "Żaden numer telefonu nie jest powiązany z tym kontem",
      emailVerificationCodeRequired: "Wprowadź kod weryfikacyjny e-mail",
      invalidEmailVerificationCode:
        "Kod weryfikacyjny e-mail jest nieprawidłowy lub wygasł",
      phoneVerificationCodeRequired: "Wprowadź kod weryfikacyjny telefonu",
      invalidPhoneVerificationCode:
        "Kod weryfikacyjny telefonu jest nieprawidłowy lub wygasł",
      newPasswordMustBeDifferentFromCurrentPassword:
        "Nowe hasło musi być inne niż bieżące hasło",
      phoneBindingChallengeExpired:
        "Sesja powiązania telefonu wygasła. Zaloguj się ponownie lub zarejestruj się ponownie.",
      manualMfaCodeNotSendable:
        "To konto używa ręcznego kodu MFA i nie może wysłać kodu",
      emailAndPasswordRequired:
        "Wprowadź adres e-mail i hasło przed żądaniem kodu dwuskładnikowego",
      mfaChallengeExpiredOrInvalid:
        "Sesja weryfikacji dwuskładnikowej wygasła. Zaloguj się ponownie.",
      challengeRequired:
        "Ukończ wyzwanie bezpieczeństwa przed żądaniem kodu.",
      captchaRequired:
        "Wolumen żądań jest wysoki. Najpierw ukończ weryfikację bezpieczeństwa.",
      rateLimitExceeded: "Zbyt wiele żądań. Spróbuj ponownie później.",
      circuitOpen:
        "Kanał dostawy jest tymczasowo chroniony. Spróbuj ponownie później.",
      cooldownActive:
        "Ten cel żądał kodów zbyt często. Spróbuj ponownie później.",
      passkeyChallengeExpired: "Sesja passkey wygasła. Spróbuj ponownie.",
      passkeyVerificationFailed:
        "Weryfikacja passkey nie powiodła się. Spróbuj ponownie lub użyj innej metody logowania.",
      passkeyAlreadyExists: "Ten passkey jest już powiązany.",
      passkeyNotFound: "Nie znaleziono passkey.",
      passkeyBrowserUnsupported:
        "Ta przeglądarka lub urządzenie nie obsługuje passkey.",
      passkeyUserHandleInvalid:
        "Nie można zidentyfikować konta dla tego passkey.",
      invalidLoginStepUpVerificationCode:
        "Kod dodatkowej weryfikacji jest nieprawidłowy lub wygasł.",
      loginStepUpChallengeExpiredOrInvalid:
        "Sesja dodatkowej weryfikacji wygasła. Zaloguj się ponownie.",
      mfaEnrollmentChallengeExpiredOrInvalid:
        "Sesja wymuszonego rejestracji MFA wygasła. Zaloguj się ponownie.",
      noAvailableMfaMethodForCurrentAccount:
        "Brak dostępnej metody MFA dla tego konta.",
      noAvailableLoginVerificationTargetForCurrentAccount:
        "Brak dostępnego celu dodatkowej weryfikacji dla tego konta.",
    },
    security: {
      loginMethods: "Metody logowania",
      phone: "Powiąż numer telefonu",
      phoneDesc:
        "Używane do dodatkowych metod logowania, weryfikacji SMS i powiadomień o bezpieczeństwie konta",
      bindPhone: "Powiąż",
      bindPhoneTitle: "Powiąż numer telefonu",
      bindPhoneHint:
        "Najpierw zweryfikuj numer telefonu przed powiązaniem. Kod weryfikacyjny zostanie wysłany na ten numer telefonu.",
      rebindPhoneHint:
        "Aby zamienić powiązany numer telefonu, najpierw zweryfikuj bieżący numer telefonu, a następnie nowy.",
      currentPhone: "Aktualnie powiązany numer telefonu",
      currentPhoneCode: "Bieżący kod weryfikacyjny telefonu",
      currentPhoneCodePlaceholder:
        "Wprowadź 6-cyfrowy kod wysłany na bieżący numer telefonu",
      sendCurrentPhoneCode: "Wyślij kod bieżącego telefonu",
      newPhone: "Numer telefonu",
      newPhoneCode: "Nowy kod weryfikacyjny telefonu",
      newPhonePlaceholder: "Wprowadź numer telefonu, np. 13800138000",
      smsCode: "Kod weryfikacyjny SMS",
      smsCodePlaceholder: "Wprowadź 6-cyfrowy kod SMS",
      safeEmail: "Bezpieczny e-mail",
      safeEmailDesc: "Główne dane uwierzytelniające używane do logowania",
      editEmailTitle: "Zmień bezpieczny e-mail",
      newEmail: "Nowy e-mail",
      newEmailPlaceholder: "Wprowadź nowy adres e-mail",
      emailCode: "Kod e-mail",
      emailCodePlaceholder: "Wprowadź 6-cyfrowy kod",
      changeEmailHint:
        "Nowy adres e-mail musi zostać zweryfikowany przed zapisaniem zmiany.",
      changePassword: "Zmień hasło",
      changePasswordDesc:
        "Regularnie aktualizuj hasło logowania, aby poprawić bezpieczeństwo konta",
      editPasswordTitle: "Zmień hasło logowania",
      currentPassword: "Bieżące hasło",
      currentPasswordPlaceholder: "Wprowadź swoje bieżące hasło",
      currentPasswordIncorrect: "Bieżące hasło jest nieprawidłowe",
      newPassword: "Nowe hasło",
      newPasswordPlaceholder: "Wprowadź nowe hasło z co najmniej 8 znakami",
      confirmPassword: "Potwierdź nowe hasło",
      confirmPasswordPlaceholder: "Wprowadź nowe hasło ponownie",
      changePasswordHint:
        "Użyj nowego hasła przy następnym logowaniu i unikaj ponownego użycia starego.",
      passwordMinLength: "Hasło musi mieć co najmniej 8 znaków",
      passwordMismatch: "Dwa nowe hasła nie pasują do siebie",
      passwordUpdated: "Hasło zaktualizowane",
      passwordUpdateFailed: "Nie udało się zaktualizować hasła",
      mfa: "Uwierzytelnianie dwuskładnikowe",
      mfaDesc: "Po włączeniu wymagana jest dodatkowa weryfikacja podczas logowania",
      mfaTitle: "Skonfiguruj uwierzytelnianie dwuskładnikowe",
      mfaHint: "Wybierz metodę drugiej weryfikacji używaną podczas logowania.",
      mfaTitleEnable: "Włącz uwierzytelnianie dwuskładnikowe",
      mfaTitleDisable: "Wyłącz uwierzytelnianie dwuskładnikowe",
      mfaHintEnable:
        "Wybierz metodę drugiej weryfikacji używaną podczas logowania.",
      mfaHintDisable:
        "Po wyłączeniu dodatkowa weryfikacja nie będzie już wymagana podczas logowania.",
      mfaMethod: "Metoda weryfikacji",
      mfaMethodEmail: "Kod e-mail",
      mfaMethodSMS: "Kod telefonu",
      passkeys: "Passkey",
      passkeysDesc:
        "Po powiązaniu możesz zalogować się bezpośrednio z selektora passkey systemu.",
      addPasskey: "Dodaj passkey",
      deletePasskey: "Usuń passkey",
      passkeyName: "Nazwa urządzenia",
      passkeyNamePlaceholder: "Wprowadź rozpoznawalną nazwę",
      passkeyLastUsed: "Ostatnio używane",
      passkeyLastUsedIP: "Ostatnio używane IP",
      passkeyCreatedAt: "Utworzono",
      passkeyEmpty: "Brak powiązanych passkey",
      passkeyManageVerify:
        "Aby chronić swoje konto, zweryfikuj swoje bieżące dane uwierzytelniające przed dodaniem lub usunięciem passkey.",
      currentMfaCode: "Bieżący kod MFA",
      currentMfaCodePlaceholder: "Wprowadź kod z bieżącej metody MFA",
      currentMfaCodeHintEmail:
        "Ukończ weryfikację aktualnie powiązanym kodem e-mail przed zapisaniem.",
      currentMfaCodeHintSMS:
        "Ukończ weryfikację aktualnie powiązanym kodem telefonu przed zapisaniem.",
      currentMfaCodeHintManual:
        "Wprowadź aktualnie skonfigurowany ręczny kod MFA przed zapisaniem.",
      accountSecurity: "Bezpieczeństwo konta",
      recentLogin: "Ostatnie logowanie",
      recentLoginDesc: "Czas ostatniego pomyślnego logowania i IP urządzenia",
    },
    profile: {
      title: "Profil",
      avatar: "Awatar",
      avatarDesc:
        "Obraz zostanie automatycznie przycięty do środka i przekonwertowany do formatu webp",
      nickname: "Nazwa użytkownika",
      nicknameDesc: "Bieżąca nazwa wyświetlana",
      gender: "Płeć",
      genderDesc: "Informacja o płci profilu dla tego konta",
      languagePreference: "Preferencja językowa",
      languagePreferenceDesc:
        "Po zalogowaniu ten język będzie używany jako pierwszy dla zawartości strony",
      languagePreferenceSaved: "Preferencja językowa zapisana",
      languagePreferenceSaveFailed: "Nie udało się zapisać preferencji językowej",
      genderMale: "Mężczyzna",
      genderFemale: "Kobieta",
      genderOther: "Inna",
      userId: "ID użytkownika",
      userIdDesc: "Unikalny identyfikator bieżącego konta w systemie",
      nicknamePlaceholder: "Wprowadź nazwę użytkownika",
      editNicknameTitle: "Edytuj nazwę użytkownika",
      editGenderTitle: "Edytuj płeć",
      email: "Adres e-mail",
      emailDesc: "Używany do logowania, weryfikacji i powiadomień o bezpieczeństwie",
      createdAt: "Zarejestrowano",
      createdAtDesc: "Czas utworzenia tego konta",
      country: "Kraj rejestracji",
      countryDesc: "Kraj lub region zapisany podczas rejestracji",
    },
    privacy: {
      title: "Centrum prywatności",
      exportTitle: "Pobierz dane użytkownika",
      exportDesc:
        "Eksportuj dane profilu i niecofnięte autoryzowane aplikacje w formacie CSV.",
      exportAction: "Pobierz dane",
      exportPasswordVerifyDesc:
        "Zweryfikuj swoje bieżące hasło logowania przed pobraniem. CSV będzie zawierać dane profilu i niecofnięte autoryzowane aplikacje.",
      exportSuccess: "Rozpoczęto pobieranie danych użytkownika",
      exportFailed: "Nie udało się wyeksportować danych użytkownika",
      minimizeTitle: "Minimalizacja danych",
      minimizeDesc:
        "System przechowuje tylko kraj rejestracji, adres e-mail, zgody i niezbędne dane bezpieczeństwa logowania.",
      scopeTitle: "Aktualny zakres dostępu",
      scopeDesc:
        "Możesz przeglądać aplikacje, które uzyskały dostęp do Twojego konta w Autoryzowanych aplikacjach i cofać je w dowolnym momencie.",
      statusTitle: "Status konta",
      statusDesc:
        "Jeśli konto jest zablokowane, logowanie zostanie zablokowane do czasu rozwiązania przez administratora.",
      deleteTitle: "Usuń konto",
      deleteDesc:
        "Jeśli zalogujesz się ponownie w ciągu 7 dni, wniosek o usunięcie zostanie automatycznie anulowany. W przeciwnym razie konto i dane zgód zostaną usunięte.",
      deleteWarningPrimary:
        "Usunięcie konta jest nieodwracalne. Najpierw wykonaj kopię zapasową wszelkich danych związanych z tym kontem.",
      deleteWarningSecondary:
        "Po złożeniu wniosku, ponowne zalogowanie się w ciągu 7 dni anuluje usunięcie. Jeśli nie zalogujesz się w ciągu 7 dni, system automatycznie usunie konto i dane zgód.",
      deleteAction: "Przeczytałem i akceptuję konsekwencje",
      passwordVerifyTitle: "Zweryfikuj bieżące hasło",
      passwordVerifyDesc:
        "Wprowadź swoje bieżące hasło logowania i ukończ weryfikację e-mail. Jeśli powiązany jest numer telefonu, wymagana jest również weryfikacja telefonu.",
      emailVerifyCode: "Kod weryfikacyjny e-mail",
      emailVerifyCodePlaceholder: "Wprowadź 6-cyfrowy kod wysłany na Twój e-mail",
      sendDeleteEmailCode: "Wyślij kod e-mail",
      sendDeleteEmailCodeSuccess:
        "Kod weryfikacyjny e-mail został wysłany. Sprawdź swoją skrzynkę odbiorczą.",
      sendDeleteEmailCodeFailed: "Nie udało się wysłać kodu weryfikacyjnego e-mail",
      phoneVerifyCode: "Kod weryfikacyjny telefonu",
      phoneVerifyCodePlaceholder: "Wprowadź 6-cyfrowy kod wysłany na Twój telefon",
      sendDeletePhoneCode: "Wyślij kod telefonu",
      sendDeletePhoneCodeSuccess:
        "Kod weryfikacyjny telefonu został wysłany. Sprawdź swój telefon.",
      sendDeletePhoneCodeFailed: "Nie udało się wysłać kodu weryfikacyjnego telefonu",
      confirmDeleteNow: "Złóż wniosek o usunięcie",
      deleteSuccess:
        "Wniosek o usunięcie złożony. Zalogowanie się w ciągu 7 dni anuluje go.",
      deleteFailed: "Nie udało się złożyć wniosku o usunięcie",
      deletePendingAt:
        "Wniosek o usunięcie złożony. Zaplanowany czas usunięcia: {{date}}",
    },
    bindings: {
      title: "Autoryzowane aplikacje",
      appId: "Nazwa aplikacji",
      scopes: "Zakresy",
      createdAt: "Autoryzowano",
      authorizedAt: "Autoryzowano",
      action: "Akcja",
      viewDetails: "Szczegóły",
      detailTitle: "Szczegóły autoryzacji",
      siteName: "Autoryzowana witryna",
      requestedPermissions: "Udzielone uprawnienia",
      scopeOpenIdTitle: "Potwierdź swoją tożsamość",
      scopeOpenIdDesc:
        "Służy do potwierdzenia, że zalogowane konto naprawdę należy do Ciebie i ustanowienia podstawowej sesji logowania.",
      scopeProfileTitle: "Uzyskaj dostęp do swojego publicznego profilu",
      scopeProfileDesc:
        "Obejmuje nazwę użytkownika, awatar i inne publiczne dane profilu do wyświetlania w aplikacji.",
      scopeEmailTitle: "Uzyskaj dostęp do swojego adresu e-mail",
      scopeEmailDesc:
        "Używany do wyświetlania adresu e-mail konta lub wysyłania powiadomień i wiązania konta, gdy jest to potrzebne.",
      scopePhoneTitle: "Uzyskaj dostęp do swojego numeru telefonu",
      scopePhoneDesc:
        "Używany do identyfikacji konta, powiadomień lub weryfikacji bezpieczeństwa, gdy jest to potrzebne.",
      scopeGatewayReadTitle: "Uzyskaj dostęp do chronionych interfejsów API biznesowych",
      scopeGatewayReadDesc:
        "Pozwala aplikacji uzyskać dostęp do chronionych zasobów API w Twoim imieniu po autoryzacji.",
      scopeCustomTitle: "Żądanie uprawnienia: {{scope}}",
      scopeCustomDesc:
        "Ta aplikacja żąda dodatkowego uprawnienia biznesowego. Przejrzyj je uważnie przed kontynuowaniem.",
      revoke: "Cofnij",
      batchRevoke: "Cofnij zbiorczo",
      batchRevokeConfirmTitle: "Potwierdzić zbiorcze cofnięcie?",
      batchRevokeConfirmDesc:
        "Wybrano {{count}} autoryzacji. Te aplikacje będą musiały ponownie poprosić o zgodę.",
    },
    help: {
      title: "Centrum pomocy",
      loginIssueTitle: "Nie można się zalogować",
      loginIssueDesc:
        "Jeśli nie możesz się zalogować, najpierw potwierdź, że używasz właściwej metody dla konta, takiej jak hasło, kod e-mail, kod telefonu lub passkey. Jeśli kod weryfikacyjny zostanie odrzucony, upewnij się, że jest najnowszy i wciąż w okresie ważności. Jeśli konto jest pokazywane jako zablokowane, oczekujące na aktywację lub w inny sposób ograniczone, problem musi zostać rozwiązany przez administratora platformy. Jeśli niedawno złożyłeś wniosek o usunięcie konta, system może również wymagać potwierdzenia usunięcia lub powiązania telefonu przed przywróceniem dostępu.",
      protectTitle: "Chroń swoje konto",
      protectDesc:
        "Włącz uwierzytelnianie dwuskładnikowe tak szybko, jak to możliwe i powiąż passkey na zaufanych urządzeniach, aby zmniejszyć ryzyko kompromitacji wyłącznie hasła. Nigdy nie udostępniaj kodów e-mail, kodów SMS ani kodów MFA stronom trzecim i nie wprowadzaj ponownie poświadczeń na stronach, którym nie ufasz. Jeśli używasz tego samego konta na wielu urządzeniach, regularnie przeglądaj ostatnie logowania, powiązane passkey i autoryzowane aplikacje oraz usuwaj urządzenia lub autoryzacje, których już nie używasz.",
      authIssueTitle: "Problemy z autoryzacją",
      authIssueDesc:
        "Jeśli aplikacja wygląda na nieznaną, żąda niezwykłych zakresów lub podejrzewasz, że nadużywa Twojego konta, otwórz Autoryzowane aplikacje, aby przejrzeć jej czas autoryzacji, udzielone zakresy i szczegóły integracji, a następnie natychmiast cofnij, jeśli to konieczne. Po cofnięciu aplikacja nie będzie już mogła uzyskać dostępu do chronionych zasobów z Twoim kontem, dopóki nie zalogujesz się ponownie i nie zatwierdzisz nowego wniosku o zgodę. Jeśli problem może dotyczyć całego konta, a nie tylko pojedynczej aplikacji, powinieneś również zmienić hasło, zweryfikować ustawienia MFA i przejrzeć ostatnie logowania i aktywność passkey.",
      contactTitle: "Skontaktuj się z nami",
      contactDesc:
        "Jeśli potrzebujesz pomocy ręcznej, możesz skontaktować się z pomocą techniczną platformy pod poniższym adresem. Zgłaszając problem, dołącz adres e-mail konta, czas wystąpienia problemu, zrzuty ekranu komunikatów o błędach, metodę logowania, której używałeś, oraz odpowiednie szczegóły urządzenia lub przeglądarki, aby problem mógł zostać szybciej zbadany.",
      contactMainlandTitle: "Chiny kontynentalne",
      contactOverseasTitle: "Zagranica",
      contactPersonLabel: "Osoba kontaktowa:",
      contactPhoneLabel: "Telefon:",
      contactEmailLabel: "E-mail:",
      contactHoursLabel: "Godziny wsparcia:",
      contactMainlandPersonValue: "YOUR_NAME",
      contactMainlandPhoneValue: "YOUR_PHONE_NUMBER",
      contactMainlandEmailValue: "YOUR_EMAIL",
      contactMainlandHoursValue: "Poniedziałek - Piątek 09:00 - 18:00",
      contactOverseasPersonValue: "YOUR_NAME_OVERSEAS",
      contactOverseasPhoneValue: "YOUR_PHONE_NUMBER_OVERSEAS",
      contactOverseasEmailValue: "YOUR_EMAIL_OVERSEAS",
      contactOverseasHoursValue: "Poniedziałek - Piątek 09:00 - 18:00",
      contactRegionNotice:
        "Skontaktuj się najpierw z kanałem wsparcia dla swojego regionu. Jeśli nie jesteś pewien, który region dotyczy, zacznij od kontaktu w Chinach kontynentalnych w celu uzyskania pomocy w kierowaniu.",
      contactNotice:
        "W przypadku problemów takich jak zablokowane konta, nietypowe autoryzacje, utracone passkey lub odzyskiwanie usunięcia, najpierw skontaktuj się z administratorem pod powyższym numerem telefonu lub adresem e-mail; jeśli Twoja platforma zapewnia oficjalny system zgłoszeń, tablicę ogłoszeń lub grupę operacyjną, postępuj zgodnie z tym oficjalnym kanałem w pierwszej kolejności.",
    },
  },
} as const;

export default locale;
