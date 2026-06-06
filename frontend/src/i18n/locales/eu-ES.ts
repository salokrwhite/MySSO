const locale = {
  translation: {
    header: {
      language: "Hizkuntza",
      languageModalTitle: "Hautatu hizkuntza",
      languageModalDesc: "Hautatu erabili nahi duzun interfazearen hizkuntza.",
      agreement: "Erabiltzailearen akordioa",
      privacy: "Pribatutasun politika",
      help: "Laguntza zentroa",
      logout: "Itxi saioa",
      accountCenter: "Kontu zentroa",
    },
    captcha: {
      securityVerification: "Segurtasun egiaztapena",
      refresh: "Berriztu",
      imageCaptcha: "Irudi CAPTCHA",
      imageCaptchaRequired: "Sartu irudi CAPTCHA",
    },
    legal: {
      back: "Itxuli hasierara",
      updatedAt: "Azken eguneraketa: {{date}}",
      agreement: {
        title: "Erabiltzailearen akordioa",
        updatedAt: "2026-03-16",
        intro:
          "Ongi etorri {{siteName}}-ra. Erregistratu, hasi saioa, integratu edo identitate bateratuaren zerbitzuak erabili aurretik, irakurri arretaz akordio hau. Zerbitzua erabiltzen jarraituz gero, akordio hau onartzen duzu.",
        sections: {
          accountTitle: "1. Kontua eta saioa hastea",
          accountP1:
            "Erregistro-informazio egia, legezkoa eta eskuragarria eman behar duzu, eta zure kontua, pasahitza, egiaztapen-kodeak eta beste kredentzialak behar bezala babestu. Zuk zara kredentzialen kudeaketa txarraren ondorioz sortutako galeren erantzule.",
          accountP2:
            "Saioa hasteko jarduera arraroa, politikak urratzea, izoztutako egoera edo segurtasun-arriskuak detektatzen badira, plataformak egiaztapen gehigarria eskatu, saioa hastea mugatu edo sarbidea eten dezake segurtasun arrazoiengatik.",
          acceptableUseTitle: "2. Erabilera onargarria",
          acceptableUseP1:
            "Ez duzu sistema hau erabili behar jarduera ilegalerako, eskubideen urraketarako, autentifikazio-interfazeen abusurako, eskaera masiboetarako, kredentzialen betetzeetarako edo plataformaren egonkortasuna mehatxatzen duen edo segurtasun-kontrolak saihesten dituen portaerarako.",
          acceptableUseP2:
            "Akordio hau edo erlazionatutako arauak urratzen badituzu, plataformak zure sarbidearen zati bat edo osoa eten edo amaitu dezake eta erantzukizuna eskatzeko eskubidea gordetzen du beharrezkoa denean.",
          authorizationTitle: "3. Baimena eta hirugarrenen aplikazioak",
          authorizationP1:
            "{{siteName}} kontu bat erabiltzen duzunean hirugarren baten aplikazio batean saioa hasteko, sistemak zure baimena eskatuko du baimen-orrian erakutsitako baimenetan oinarrituta. Baimen hori edozein unetan ukatu edo indargabetu dezakezu kontu zentroan.",
          authorizationP2:
            "Baimena eman ondoren hirugarren baten aplikazio batek zure datuak erabiltzea aplikazio horren zerbitzu-baldintza eta pribatutasun politika propioek arautzen dute. Plataformak erantzukizuna hartuko du soilik legeak eskatzen duen neurrian.",
          developerTitle: "4. Garatzailearen integrazioa",
          developerP1:
            "Garatzaileek ziurtatu behar dute aplikazioaren informazioa, birbideratze-URIak, eskatutako esparruak eta helburu komertzialak egiazkoak, osoak eta etengabe baliozkoak direla, eta ez dituzte erabiltzaileak engainatu behar.",
          developerP2:
            "Plataformak konektatutako aplikazioak berrikusi, ukatu, kendu, ezabatu edo mugatu ditzake identitate bateratuaren ekosistemaren segurtasuna eta osotasuna mantentzeko.",
          liabilityTitle: "5. Zerbitzuaren aldaketak eta erantzukizunaren mugaketa",
          liabilityP1:
            "Segurtasun, betetze, operazio edo mantentze arrazoiengatik, plataformak interfaze, fluxu edo funtzio jakin batzuk doitu, eguneratu, eten edo amaitu ditzake eta abisua ematen saiatuko da egokia denean.",
          liabilityP2:
            "Legeak baimentzen duen neurrian, plataforma ez da erantzule izango betebeharrak gainditzen dituzten eten, datu arraro edo galeren gainean, indar handiagoko gertaerak, sare-akatsak, hirugarrenen arrazoiak edo zure aldetik erabilera okerragatik eragindakoak.",
        },
      },
      privacy: {
        title: "Pribatutasun politika",
        updatedAt: "2026-03-16",
        intro:
          "{{siteName}}-k zure informazio pertsonala eta kontuaren segurtasuna baloratzen ditu. Politika honek azaltzen du nola biltzen, erabiltzen, gordetzen, partekatzen eta babesten ditugun zure datuak, baita zure eskura dauden eskubideak ere.",
        sections: {
          dataCollectionTitle: "1. Biltzen dugun informazioa",
          dataCollectionP1:
            "Erregistratzen, saioa hasten edo kontu-zerbitzuak erabiltzen dituzunean, zure erregistro-herrialdea, helbide elektronikoa, telefono-zenbakia, pasahitzaren hash-a, saioa hasteko saioak, gailuaren IP-a, baimen-erregistroak eta beharrezko segurtasun-erregistroak bildu ditzakegu.",
          dataCollectionP2:
            "Avatar bat igotzen, zure profila aldatzen, telefono-zenbaki bat lotzen, MFA gaitzen edo hirugarren baten aplikazio bat baimentzen duzunean, bidaltzen duzun informazioa prozesatzen dugu funtzio hori emateko beharrezkoa den bezala.",
          dataUsageTitle: "2. Nola erabiltzen dugu informazioa",
          dataUsageP1:
            "Informazio egokia erabiltzen dugu kontuaren erregistroa, saioa hasteko autentifikazioa, egiaztapen-kodeen entrega, arriskuen kontrola, baimenaren berrespena, garatzaileen aplikazioen berrikuspena, kontuaren segurtasun-jakinarazpenak eta zerbitzuaren fidagarritasunaren mantentzea emateko.",
          dataUsageP2:
            "Gainera, erregistroak eta estatistikak aztertzen ditugu gutxieneko oinarri beharrezkoan jarduera arraroa detektatzeko, produktuaren esperientzia hobetzeko eta segurtasuna indartzeko.",
          dataSharingTitle: "3. Partekatzea eta argitaratzea",
          dataSharingP1:
            "Identitate-informazioa edo baimenarekin lotutako datuak hirugarrenen aplikazioei soilik ematen dizkiegu baimen-orrian erakutsitako esparruak esplizituki baimentzen dituzunean.",
          dataSharingP2:
            "Legeak, erregulazio-eskaerek, interes publikoaren babesak edo sistemaren segurtasun-beharrek eskatzen duten kasuetan izan ezik, ez dugu zure informazio pertsonala saltzen edo legez kanpo partekatzen harremanik gabeko hirugarrenekin.",
          userRightsTitle: "4. Zure eskubideak",
          userRightsP1:
            "Zure profila, loturak, baimen-erregistroak eta segurtasun-ezarpenak ikusi eta egunera ditzakezu kontu zentroan, eta aplikazioen baimenak indargabetu edo kontua ezabatzeko eskaera bidali dezakezu.",
          userRightsP2:
            "Zure informazioa zehaztugabea, oker prozesatua edo beharrezkoa dena baino gehiago erabilia dela uste baduzu, plataformaren operadorearekin harremanetan jar zaitezke edo zure eskubideak erabili dagozkion legeen arabera.",
          securityTitle: "5. Babesa eta kontserbazioa",
          securityP1:
            "Sarbide-kontrolak, pasahitzen hash-a, egiaztapen-kodeen iraungipena, auditoretza-erregistroak eta datuen minimizazio-neurriak erabiltzen ditugu zure informazio pertsonala eta autentifikazio-datuak babesteko.",
          securityP2:
            "Lege eta negozio-eskakizunen mende, zure informazioa zerbitzuaren helburuak betetzeko beharrezkoa den denboran soilik gordetzen dugu; kontua ezabatu edo gordetze-epeak iraungi ondoren, datuak ezabatu edo anonimizatuko ditugu politikaren arabera.",
        },
      },
    },
    auth: {
      noAccount: "Ez duzu konturik?",
      registerNow: "Erregistratu orain",
      registerPageTitle: "Sortu kontua",
      registerPageSubtitle:
        "Osatu erregistroa zure herrialdea, helbide elektronikoa eta helbide elektronikoaren egiaztapen-kodearekin.",
      registerDisabled: "Erregistroa une honetan desgaituta dago",
      registerSuccess:
        "Erregistroa arrakastaz egin da. Hasi saioa zure pasahitzarekin.",
      phoneBindingRequiredAfterRegister:
        "Erregistroa arrakastaz egin da. Lotu zure telefono-zenbakia kontua aktibatzeko lehenik.",
      registerFailed: "Erregistroak huts egin du",
      country: "Herrialdea",
      countryRequired: "Hautatu herrialde bat",
      registerCode: "Helbide elektronikoaren kodea",
      registerCodeRequired: "Sartu helbide elektronikoaren egiaztapen-kodea",
      registerCodePlaceholder: "Sartu 6 digituko kodea",
      sendRegisterCode: "Bidali kodea",
      sendRegisterCodeSuccess:
        "Egiaztapen-kodea bidali da. Begiratu zure sarrera-ontzia.",
      sendRegisterCodeFailed: "Egiaztapen-kodea bidaltzeak huts egin du",
      backToLoginWithAccount: "Kontua baduzu? Hasi saioa",
      forgotPassword: "Pasahitza ahaztu duzu?",
      forgotPasswordPageTitle: "Berrezarri pasahitza",
      forgotPasswordPageSubtitle:
        "Berrezarri zure saioa hasteko pasahitza zure erregistratutako helbide elektronikoarekin eta egiaztapen-kodearekin.",
      forgotPasswordPrompt: "Pasahitza ahaztu duzu?",
      forgotPasswordAction: "Berreskuratu",
      forgotPasswordDesc:
        "Zure helbide elektronikoa kode batekin egiaztatu ondoren, saioa hasteko pasahitz berri bat ezar dezakezu zuzenean.",
      forgotPasswordHint:
        "Sartu zure erregistratutako helbide elektronikoa, egiaztapen-kodea eta pasahitz berri bat. Pasahitz berriarekin saioa has dezakezu berehala bidali ondoren.",
      goToOtpLogin: "Erabili helbide elektronikoaren kodearekin saioa hastea",
      resetCode: "Berreskuratze-kodea",
      sendResetCode: "Bidali berreskuratze-kodea",
      sendResetCodeSuccess:
        "Berreskuratze-kodea bidali da. Begiratu zure sarrera-ontzia.",
      sendResetCodeFailed: "Berreskuratze-kodea bidaltzeak huts egin du",
      resetPassword: "Berrezarri pasahitza",
      resetPasswordSuccess:
        "Pasahitza berrezarri da. Hasi saioa zure pasahitz berriarekin.",
      resetPasswordFailed: "Pasahitza berrezartzeak huts egin du",
      newPassword: "Pasahitz berria",
      confirmNewPassword: "Berretsi pasahitz berria",
      newPasswordPlaceholder: "Sartu gutxienez 8 karaktereko pasahitz bat",
      confirmPassword: "Berretsi pasahitza",
      confirmPasswordPlaceholder: "Sartu pasahitza berriro",
      backToLogin: "Itzuli saioa hastera",
      emailRequired: "Sartu zure helbide elektronikoa",
      passwordRequired: "Sartu zure pasahitza",
      otpCodeRequired: "Sartu helbide elektronikoaren egiaztapen-kodea",
      phoneRequired: "Sartu zure telefono-zenbakia",
      phoneOtpCodeRequired: "Sartu SMS egiaztapen-kodea",
      emailInvalid: "Sartu baliozko helbide elektronikoaren helbide bat",
      resetCodeRequired: "Sartu berreskuratze-kodea",
      resetCodePlaceholder: "Sartu 6 digituko berreskuratze-kodea",
      newPasswordRequired: "Sartu pasahitz berri bat",
      confirmNewPasswordRequired: "Berretsi pasahitz berria berriro",
      newPasswordMinLength: "Pasahitz berriak gutxienez 8 karaktere izan behar ditu",
      passwordMinLength: "Pasahitzak gutxienez 8 karaktere izan behar ditu",
      newPasswordMismatch: "Bi pasahitz berriak ez datoz bat",
      passwordMismatch: "Bi pasahitzak ez datoz bat",
      registrationClosed: "Erregistroa une honetan itxita dago",
      login: "Hasi saioa",
      passkeyLogin: "Sarbide-gakoa",
      passkeyLoginDesc:
        "Erabili gune honetarako dagoeneko lotutako sarbide-gako bat zure gailuan edo sistemako kontuan.",
      passkeyLoginButton: "Erabili sarbide-gakoa",
      passkeyLoginHint:
        "Sarbide-gako bat lotu behar duzu kontu zentroan hemen erabili aurretik.",
      passkeyLoginSuccess: "Sarbide-gakoa arrakastaz gehitu da",
      passkeyNotAvailable:
        "Ez dago sarbide-gakorik gune honetarako gailu honetan. Erabili saioa hasteko beste metodo bat.",
      qrLogin: "QR kodea",
      qrLoginDesc: "Saioa hasteko escaneatu QR kodea MySSO Android aplikazioarekin.",
      qrLoginScanned: "Escaneatuta. Baieztatu saioa hasteko mugikorreko aplikazioan.",
      qrLoginScannedMask: "QR kode hau dagoeneko escaneatuta dago",
      qrLoginCancelled: "QR saio hau bertan bezelako da",
      qrLoginExpired: "QR kodea iraungi da. Eguneratu.",
      qrLoginRefresh: "QR kodea eguneratu",
      passwordLogin: "Pasahitza",
      otpLogin: "Helbide elektronikoaren kodea",
      phoneOtpLogin: "Telefono-kodea",
      email: "Helbide elektronikoa",
      phone: "Telefono-zenbakia",
      password: "Pasahitza",
      otpCode: "Helbide elektronikoaren kodea",
      phoneOtpCode: "SMS kodea",
      mfaCode: "2FA kodea",
      mfaPlaceholder: "Utzi hutsik bi faktoreko autentifikazioa gaituta ez badago",
      sendOtpCode: "Bidali helbide elektronikoaren kodea",
      sendOtpCodeSuccess:
        "Helbide elektronikoaren kodea bidali da. Begiratu zure sarrera-ontzia.",
      sendOtpCodeFailed: "Egiaztapen-kodea bidaltzeak huts egin du",
      sendOtpCodeEmailRequired: "Sartu zure helbide elektronikoa kode bat eskatu aurretik",
      sendPhoneOtpCode: "Bidali SMS kodea",
      sendPhoneOtpCodeSuccess:
        "SMS kodea bidali da. Begiratu zure telefonoa.",
      sendPhoneOtpCodeFailed: "SMS kodea bidaltzeak huts egin du",
      sendPhoneBindingCode: "Bidali lotze-kodea",
      sendPhoneBindingCodeSuccess:
        "Telefono-lotzearen kodea bidali da. Begiratu zure telefonoa.",
      sendPhoneBindingCodeFailed: "Telefono-lotzearen kodea bidaltzeak huts egin du",
      securityCaptcha: "Segurtasun-egiaztapena",
      securityCaptchaPlaceholder:
        "Sartu segurtasun-egiaztapenaren balioa eta saiatu berriro",
      securityCaptchaHelp:
        "Uneko gailuak edo IPak eskaerak gehiegi bidaltzen dituenean, osatu segurtasun-egiaztapen hau beste kode bat eskatu aurretik.",
      securityCaptchaRequiredTip:
        "Eskaeren bolumena altua da. Osatu segurtasun-egiaztapena beste kode bat eskatu aurretik.",
      sendOtpCodePhoneRequired:
        "Sartu zure telefono-zenbakia kode bat eskatu aurretik",
      phoneBindingPageTitle: "Lotu telefono-zenbakia",
      phoneBindingRegisterDesc:
        "Kontu honek erregistro ondorengo arrisku-araua aktibatu du. Lotu telefono-zenbaki bat jarraitu aurretik.",
      phoneBindingLoginDesc:
        "Kontu honek saioa hasteko arrisku-araua aktibatu du. Lotu telefono-zenbaki bat jarraitu aurretik.",
      completePhoneBinding: "Lotu eta jarraitu",
      phoneBindingSuccess:
        "Telefono-zenbakia arrakastaz lotu da. Kontua berriro aktibo dago.",
      mfaVerifyTitle: "Bi faktoreko egiaztapena",
      mfaVerifyEmailHint:
        "Egiaztapen-kode bat bidali da {{target}}-ra. Sartu saioa hasten jarraitzeko.",
      mfaVerifyPhoneHint:
        "Egiaztapen-kode bat bidali da {{target}}-ra. Sartu saioa hasten jarraitzeko.",
      loginStepUpTitle: "Saioa hasteko egiaztapen gehigarria",
      loginStepUpEmailDesc:
        "Saioa haste honek helbide elektronikoaren egiaztapen gehigarria eskatzen du. Kode bat bidaliko da {{email}}-ra.",
      loginStepUpSMSDesc:
        "Saioa haste honek telefono-egiaztapen gehigarria eskatzen du. Kode bat bidaliko da {{phone}}-ra.",
      loginStepUpDualDesc:
        "Saioa haste honek helbide elektronikoaren eta telefonoaren egiaztapena eskatzen du. Helbide elektronikoa: {{email}}, telefonoa: {{phone}}.",
      loginStepUpExpired:
        "Saioa hasteko egiaztapen gehigarriaren saioa iraungi da. Hasi saioa berriro.",
      forcedMfaEnrollmentTitle: "Bi faktoreko autentifikazioa gaitu behar da",
      forcedMfaEnrollmentDesc:
        "Administratzaile batek kontu honek bi faktoreko autentifikazioa gaitu behar duela eskatzen du saioa haste hau osatu aurretik.",
      forcedMfaEnrollmentExpired:
        "MFA izena emate behartuaren saioa iraungi da. Hasi saioa berriro.",
      completeForcedMfaEnrollment: "Gaitu eta jarraitu",
      cancelForcedMfaEnrollment: "Utzi eta itzuli saioa hastera",
      verifyAndLogin: "Egiaztatu eta hasi saioa",
      deletionConfirmTitle: "Kontua ezabatzeko eskaera bidali da",
      deletionConfirmScheduledAt: "Ezabatzeko data programatua: {{date}}",
      deletionConfirmDesc:
        "Berriro saioa hasten baduzu, ezabatzea bertan behera utziko da.",
      deletionConfirmContinue: "Jarraitu eta utzi ezabatzea bertan behera",
      deletionConfirmExpired: "Berrespena iraungi da, hasi saioa berriro",
      deletionConfirmFailed: "Berrespenak huts egin du, hasi saioa berriro",
      logoutProgressTitle: "Saioa ixten",
      logoutProgressDesc:
        "Identitate-saioa garbitu da eta konektatutako aplikazioak saioa ixten ari dira.",
      loginFailed: "Saioa hasteak huts egin du",
      oidcCallbackFailed: "OIDC Callback-ek huts egin du",
      appRejected: "Aplikazioa baztertu da",
      appRejectedWithReason: "Aplikazioa baztertu da: {{reason}}",
      appNotFound: "Ez da aplikaziorik aurkitu",
      accessDenied: "Sarbidea ukatuta",
      tokenExchangeFailed: "Token-trukeak huts egin du",
      authorize: {
        title: "Erabili {{siteName}} {{appName}}-n saioa hasteko",
        desc: "Aplikazio honek ondorengo informazioa eta baimenak eskatzen ditu. Berretsi ondoren, negozio-aplikaziora itzuliko zara saioa hastea osatzeko.",
        chooseAccountTitle: "Dagoeneko {{siteName}}-n saioa hasita duzu",
        chooseAccountDesc:
          "Aukeratu uneko kontuarekin jarraitu edo lehenik kontu desberdin batekin saioa hasi nahi duzun.",
        currentAccountFallback: "Uneko kontua",
        useCurrentAccount: "Jarraitu kontu honekin",
        useAnotherAccount: "Hasi saioa beste kontu batekin",
        permissionTitle: "Eskatutako baimenak",
        permissionCount: "{{count}} elementu",
        agreement:
          "Irakurri dut eta onartzen ditut aurrean zerrendatutako baimenak",
        confirm: "Berretsi eta jarraitu",
        cancel: "Utzi eta itzuli saioa hastera",
        errors: {
          applicationRejected: "Aplikazioa baztertu da",
          applicationRejectedWithReason: "Aplikazioa baztertu da: {{reason}}",
          applicationAccessRestricted: "Aplikazioaren sarbidea mugatua da",
          applicationAccessBanned: "Aplikazioaren sarbidea debekatuta da",
          applicationAccessBannedWithReason: "Aplikazioaren sarbidea debekatuta da: {{reason}}",
          applicationNotApproved: "Aplikazioa ez da onartzen",
          applicationNotFound: "Ez da aplikaziorik aurkitu",
          forbidden: "Ez duzu aplikazio honetara sarbidea",
          unsupportedResponseType: "Emaitza mota ez da onartzen",
          redirectUriMismatch: "Birbideratze-URIak ez datoz bat",
          scopeNotAllowed: "Eskatutako esparrua ez da onartzen",
          openidScopeRequired: "Openid esparrua beharrezkoa da",
          codeChallengeMethodRequiresCodeChallenge: "Code_challenge_method eskatzean, code_challenge ere beharrezkoa da",
          unsupportedCodeChallengeMethod: "Code challenge metodo ez da onartzen",
          promptNoneMustNotBeCombinedWithOtherValues: "Prompt-aren 'none' balioa ezin da beste balioekin konbinatu",
          invalidMaxAge: "Max_age balioa baliogabea da",
          acrValuesNotSatisfied: "Uneko saioa ez da eskatutako autentifikazio-kontextua betetzen",
          consentRequired: "Baimena beharrezkoa da",
          loginRequired: "Berriro saioa hasi behar duzu jarraitzeko",
          authorizeFailed: "Baimena ematea huts egin du. Saiatu berriro geroago.",
          loadAuthorizationSettingsFailed: "Baimen ezarpenak kargatzea huts egin du",
          networkRequestFailed: "Sare-eskaera huts egin du. Egiaztatu zure konexioa eta saiatu berriro.",
          apiReturnedHtml: "Baimen zerbitzuak orri ezusteko itzuli da. Egiaztatu API edo proxy alderantzizko konfigurazioa.",
        },
        scopes: {
          openidTitle: "Berretsi zure nortasuna",
          openidDesc:
            "Unean saioa hasitako kontua zurea dela egiaztatzeko eta oinarrizko saioa hasteko saioa ezartzeko erabiltzen da.",
          profileTitle: "Sartu zure profil publikora",
          profileDesc:
            "Zure bistaratze-izena, avatarraren eta profil publikoko datu antzekoak aplikazioan aurkezteko barne hartzen ditu.",
          emailTitle: "Sartu zure helbide elektronikoaren informaziora",
          emailDesc:
            "Zure kontuaren helbide elektronikoa erakusteko edo jakinarazpenak eta kontuaren lotura onartzeko erabiltzen da beharrezkoa denean.",
          phoneTitle: "Sartu zure telefono-zenbakira",
          phoneDesc:
            "Kontuaren ezagutza, jakinarazpenak edo segurtasun-egiaztapena egiteko erabiltzen da beharrezkoa denean.",
          gatewayReadTitle: "Sartu babestutako negozio-APIetara",
          gatewayReadDesc:
            "Aplikazioari baimentzen dio zure baimendutako nortasun gisa babestutako baliabideetara sartzeko.",
          customTitle: "Baimena eskatzen: {{scope}}",
          customDesc:
            "Aplikazio honek negozio-baimen gehigarri bat eskatzen du. Berrikusi arretaz jarraitu aurretik.",
        },
      },
      sessionConflict: {
        title: "Kontu desberdinak detektatu dira arakatzaile honetan",
        desc: "Leiho honek gogoratutako kontua ez dator bat arakatzailearen une honetan aktibo dagoen kontuarekin. Kontu nagusi bat bakarrik egon daiteke aktibo arakatzaile berean aldi berean. Aukeratu zein konturekin jarraitu nahi duzun.",
        browserAccount: "Arakatzailearen kontu aktiboa",
        thisWindowAccount: "Leiho honen aurreko kontua",
        useBrowserAccount: "Erabili arakatzailearen kontu aktiboa",
        useThisWindowAccount: "Aldatu leiho honen kontura",
        relogin: "Itxi saioa eta hasi berriro",
      },
    },
    nav: {
      security: "Saioa hastea eta segurtasuna",
      profile: "Profila",
      privacy: "Pribatutasun zentroa",
      bindings: "Baimendutako aplikazioak",
      help: "Laguntza zentroa",
    },
    common: {
      loadingFailed: "Kargatzeak huts egin du",
      revokeFailed: "Baimena indargabetzeak huts egin du",
      revokeSuccess: "Baimena indargabetuta",
      confirm: "Berretsi",
      sendCode: "Bidali kodea",
      sendCodeSuccess: "Egiaztapen-kodea arrakastaz bidali da",
      sendingCode: "Bidaltzen",
      save: "Gorde",
      saving: "Gordetzen",
      edit: "Editatu",
      cancel: "Utzi",
      uploadAvatar: "Igo avatarraren irudia",
      avatarUpdated: "Avatarraren irudia eguneratu da",
      avatarUploadFailed: "Avatarraren irudia igotzeak huts egin du",
      profileUpdated: "Profila eguneratu da",
      profileUpdateFailed: "Profila eguneratzeak huts egin du",
      imageReadFailed: "Irudia irakurtzeak huts egin du",
      imageProcessUnsupported:
        "Irudiaren prozesamendua ez da onartzen arakatzaile honetan",
      avatarConvertFailed: "Avatarraren irudia bihurtzeak huts egin du",
      unset: "Ezarri gabe",
      unsetShort: "Ezarri gabe",
      notFilled: "Eman gabe",
      noRecord: "Erregistrorik ez",
      normal: "Aktiboa",
      accountCenter: "Kontu zentroa",
      noAuthorizedApps: "Baimendutako aplikaziorik ez",
    },
    errors: {
      applicationDisabled: "Aplikazio hau desgaituta dago",
      emailRequiredByServer: "Sartu zure helbide elektronikoa",
      passwordRequiredByServer: "Sartu zure pasahitza",
      invalidCredentials: "Kontu edo kredentzial baliogabeak",
      invalidOtpCode: "Egiaztapen-kodea baliogabea da edo iraungi da",
      accountFrozen: "Kontu hau izoztuta dago",
      accountFrozenWithReason:
        "Kontu hau izoztuta dago. Arrazoia: {{reason}}",
      userNotFound: "Ez da erabiltzailea aurkitu",
      smsNotConfigured: "SMS bidalketa ez dago konfiguratuta",
      smtpNotConfigured: "Helbide elektronikoaren bidalketa ez dago konfiguratuta",
      userStatusInvalid:
        "Kontuaren uneko egoerak ez du ekintza hau baimentzen",
      invalidCurrentPhoneVerificationCode:
        "Uneko telefono-egiaztapenaren kodea baliogabea da edo iraungi da",
      invalidNewPhoneVerificationCode:
        "Telefono-egiaztapenaren kode berria baliogabea da edo iraungi da",
      currentPhoneVerificationCodeRequired:
        "Sartu uneko telefono-egiaztapenaren kodea",
      currentPhoneNotBound:
        "Ez dago telefono-zenbakirik kontu honi une honetan lotuta",
      phoneDoesNotMatchCurrentBoundPhone:
        "Telefono-zenbakia ez dator bat une honetan lotutakoarekin",
      phoneAlreadyBound: "Telefono-zenbaki hau dagoeneko lotuta dago",
      newPhoneMustBeDifferent:
        "Telefono-zenbaki berria unekoa baino desberdina izan behar da",
      phoneAndVerificationCodeRequired:
        "Sartu telefono-zenbakia eta telefono-egiaztapenaren kode berria",
      invalidMfaCode: "Bi faktoreko egiaztapen-kodea baliogabea da edo iraungi da",
      unsupportedMfaMethod: "Onartu gabeko bi faktoreko autentifikazio-metodoa",
      mfaNotEnabled:
        "Bi faktoreko autentifikazioa ez dago gaituta kontu honentzat",
      emailNotBound: "Ez dago helbide elektronikorik kontu honi lotuta",
      phoneNotBound: "Ez dago telefono-zenbakirik kontu honi lotuta",
      emailVerificationCodeRequired: "Sartu helbide elektronikoaren egiaztapen-kodea",
      invalidEmailVerificationCode:
        "Helbide elektronikoaren egiaztapen-kodea baliogabea da edo iraungi da",
      phoneVerificationCodeRequired: "Sartu telefono-egiaztapenaren kodea",
      invalidPhoneVerificationCode:
        "Telefono-egiaztapenaren kodea baliogabea da edo iraungi da",
      newPasswordMustBeDifferentFromCurrentPassword:
        "Pasahitz berria uneko pasahitzarekin desberdina izan behar da",
      phoneBindingChallengeExpired:
        "Telefono-lotzearen saioa iraungi da. Hasi saioa edo erregistratu berriro.",
      manualMfaCodeNotSendable:
        "Kontu honek MFA kode eskuzkoa erabiltzen du eta ezin du koderik bidali",
      emailAndPasswordRequired:
        "Sartu zure helbide elektronikoa eta pasahitza bi faktoreko kode bat eskatu aurretik",
      mfaChallengeExpiredOrInvalid:
        "Bi faktoreko egiaztapenaren saioa iraungi da. Hasi saioa berriro.",
      challengeRequired:
        "Osatu segurtasun-erronka kode bat eskatu aurretik.",
      captchaRequired:
        "Eskaeren bolumena altua da. Osatu segurtasun-egiaztapena lehenik.",
      circuitOpen:
        "Entrega-kanala aldi baterako babestuta dago. Saiatu berriro geroago.",
      cooldownActive:
        "Helburu honek kodeak gehiegi eskatu ditu. Saiatu berriro geroago.",
      passkeyChallengeExpired: "Sarbide-gakoaren saioa iraungi da. Saiatu berriro.",
      passkeyVerificationFailed:
        "Sarbide-gakoaren egiaztapenak huts egin du. Saiatu berriro edo erabili saioa hasteko beste metodo bat.",
      passkeyAlreadyExists: "Sarbide-gako hau dagoeneko lotuta dago.",
      passkeyNotFound: "Ez da sarbide-gakorik aurkitu.",
      passkeyBrowserUnsupported:
        "Arakatzaile edo gailu honek ez ditu sarbide-gakoak onartzen.",
      passkeyUserHandleInvalid:
        "Sarbide-gako honen kontua ezin izan da identifikatu.",
      invalidLoginStepUpVerificationCode:
        "Egiaztapen-kode gehigarria baliogabea da edo iraungi da.",
      loginStepUpChallengeExpiredOrInvalid:
        "Egiaztapen gehigarriaren saioa iraungi da. Hasi saioa berriro.",
      mfaEnrollmentChallengeExpiredOrInvalid:
        "MFA izena emate behartuaren saioa iraungi da. Hasi saioa berriro.",
      noAvailableMfaMethodForCurrentAccount:
        "Ez dago MFA-metodorik erabilgarri kontu honentzat.",
      noAvailableLoginVerificationTargetForCurrentAccount:
        "Ez dago egiaztapen gehigarriaren helbururik erabilgarri kontu honentzat.",
    },
    security: {
      loginMethods: "Saioa hasteko metodoak",
      phone: "Lotu telefono-zenbakia",
      phoneDesc:
        "Saioa hasteko metodo gehigarrietarako, SMS egiaztapenerako eta kontuaren segurtasun-jakinarazpenetarako erabiltzen da",
      bindPhone: "Lotu",
      bindPhoneTitle: "Lotu telefono-zenbakia",
      bindPhoneHint:
        "Egiaztatu telefono-zenbakia lehenik lotu aurretik. Egiaztapen-kodea telefono-zenbaki honetara bidaliko da.",
      rebindPhoneHint:
        "Lotutako telefono-zenbakia ordezkatzeko, egiaztatu uneko telefono-zenbakia lehenik eta gero egiaztatu berria.",
      currentPhone: "Unean lotutako telefono-zenbakia",
      currentPhoneCode: "Uneko telefono-egiaztapenaren kodea",
      currentPhoneCodePlaceholder:
        "Sartu uneko telefono-zenbakira bidalitako 6 digituko kodea",
      sendCurrentPhoneCode: "Bidali uneko telefono-kodea",
      newPhone: "Telefono-zenbakia",
      newPhoneCode: "Telefono-egiaztapenaren kode berria",
      newPhonePlaceholder: "Sartu telefono-zenbaki bat, adibidez 612345678",
      smsCode: "SMS egiaztapen-kodea",
      smsCodePlaceholder: "Sartu 6 digituko SMS kodea",
      safeEmail: "Helbide elektroniko segurua",
      safeEmailDesc: "Saioa hasteko erabiltzen den kredentzial nagusia",
      editEmailTitle: "Aldatu helbide elektroniko segurua",
      newEmail: "Helbide elektroniko berria",
      newEmailPlaceholder: "Sartu helbide elektronikoaren helbide berria",
      emailCode: "Helbide elektronikoaren kodea",
      emailCodePlaceholder: "Sartu 6 digituko kodea",
      changeEmailHint:
        "Helbide elektroniko berria egiaztatu behar da aldaketa gorde aurretik.",
      changePassword: "Aldatu pasahitza",
      changePasswordDesc:
        "Eguneratu zure saioa hasteko pasahitza maiz kontuaren segurtasuna hobetzeko",
      editPasswordTitle: "Aldatu saioa hasteko pasahitza",
      currentPassword: "Uneko pasahitza",
      currentPasswordPlaceholder: "Sartu zure uneko pasahitza",
      currentPasswordIncorrect: "Uneko pasahitza okerra da",
      newPassword: "Pasahitz berria",
      newPasswordPlaceholder: "Sartu gutxienez 8 karaktereko pasahitz berri bat",
      confirmPassword: "Berretsi pasahitz berria",
      confirmPasswordPlaceholder: "Sartu pasahitz berria berriro",
      changePasswordHint:
        "Erabili pasahitz berria hurrengoan saioa hastean eta saihestu aurrekoa berriro erabiltzea.",
      passwordMinLength: "Pasahitzak gutxienez 8 karaktere izan behar ditu",
      passwordMismatch: "Bi pasahitz berriak ez datoz bat",
      passwordUpdated: "Pasahitza eguneratu da",
      passwordUpdateFailed: "Pasahitza eguneratzeak huts egin du",
      mfa: "Bi faktoreko autentifikazioa",
      mfaDesc: "Gaituta dagoenean, egiaztapen gehigarria eskatzen da saioa hastean",
      mfaTitle: "Konfiguratu bi faktoreko autentifikazioa",
      mfaHint: "Aukeratu saioa hastean erabiltzen den bigarren egiaztapen-metodoa.",
      mfaTitleEnable: "Gaitu bi faktoreko autentifikazioa",
      mfaTitleDisable: "Desgaitu bi faktoreko autentifikazioa",
      mfaHintEnable:
        "Aukeratu saioa hastean erabiltzen den bigarren egiaztapen-metodoa.",
      mfaHintDisable:
        "Desgaitu ondoren, ez da egiaztapen gehigarririk eskatuko saioa hastean.",
      mfaMethod: "Egiaztapen-metodoa",
      mfaMethodEmail: "Helbide elektronikoaren kodea",
      mfaMethodSMS: "Telefono-kodea",
      passkeys: "Sarbide-gakoak",
      passkeysDesc:
        "Lotu ondoren, zuzenean has dezakezu saioa sistemaren sarbide-gakoen hautatzailetik.",
      addPasskey: "Gehitu sarbide-gakoa",
      deletePasskey: "Ezabatu sarbide-gakoa",
      passkeyName: "Gailuaren izena",
      passkeyNamePlaceholder: "Sartu izen ezagutzaile bat",
      passkeyLastUsed: "Azken erabilera",
      passkeyLastUsedIP: "Azken erabilitako IP",
      passkeyCreatedAt: "Sortuta",
      passkeyEmpty: "Ez dago lotutako sarbide-gakorik",
      passkeyManageVerify:
        "Zure kontua babesteko, egiaztatu zure uneko kredentzialak sarbide-gako bat gehitu edo ezabatu aurretik.",
      currentMfaCode: "Uneko MFA kodea",
      currentMfaCodePlaceholder: "Sartu kodea uneko MFA metodoan",
      currentMfaCodeHintEmail:
        "Osatu egiaztapena une honetan lotutako helbide elektronikoaren kodearekin gorde aurretik.",
      currentMfaCodeHintSMS:
        "Osatu egiaztapena une honetan lotutako telefono-kodearekin gorde aurretik.",
      currentMfaCodeHintManual:
        "Sartu une honetan konfiguratutako MFA kode eskuzkoa gorde aurretik.",
      accountSecurity: "Kontuaren segurtasuna",
      recentLogin: "Azken saioa",
      recentLoginDesc: "Azken saioa arrakastaz hasteko ordua eta gailuaren IP",
    },
    profile: {
      title: "Profila",
      avatar: "Avatarraren irudia",
      avatarDesc:
        "Irudia automatikoki erdian moztu eta webp formatura bihurtuko da",
      nickname: "Ezizena",
      nicknameDesc: "Uneko bistaratze-izena",
      gender: "Generoa",
      genderDesc: "Kontu honen profilaren genero-informazioa",
      languagePreference: "Hizkuntza-hobespena",
      languagePreferenceDesc:
        "Saioa hasi ondoren, hizkuntza hau erabiliko da lehenik orriaren edukirako",
      languagePreferenceSaved: "Hizkuntza-hobespena gorde da",
      languagePreferenceSaveFailed: "Hizkuntza-hobespena gordetzeak huts egin du",
      genderMale: "Gizonezkoa",
      genderFemale: "Emakumezkoa",
      genderOther: "Beste bat",
      userId: "Erabiltzailearen IDa",
      userIdDesc: "Kontu honen identifikatzaile bakarra sisteman",
      nicknamePlaceholder: "Sartu ezizena",
      editNicknameTitle: "Editatu ezizena",
      editGenderTitle: "Editatu generoa",
      email: "Helbide elektronikoaren helbidea",
      emailDesc: "Saioa hasteko, egiaztapenerako eta segurtasun-jakinarazpenetarako erabiltzen da",
      createdAt: "Erregistratuta",
      createdAtDesc: "Kontu hau sortu zen ordua",
      country: "Erregistro-herrialdea",
      countryDesc: "Erregistratzean erregistratutako herrialdea edo eskualdea",
    },
    privacy: {
      title: "Pribatutasun zentroa",
      exportTitle: "Deskargatu erabiltzailearen datuak",
      exportDesc:
        "Esportatu profilaren datuak eta indargabetu gabeko baimendutako aplikazioak CSV formatuan.",
      exportAction: "Deskargatu datuak",
      exportPasswordVerifyDesc:
        "Egiaztatu zure uneko saioa hasteko pasahitza deskargatu aurretik. CSVk profilaren datuak eta indargabetu gabeko baimendutako aplikazioak barne hartuko ditu.",
      exportSuccess: "Erabiltzailearen datuen deskarga hasi da",
      exportFailed: "Erabiltzailearen datuak esportatzeak huts egin du",
      minimizeTitle: "Datuen minimizazioa",
      minimizeDesc:
        "Sistemak erregistro-herrialdea, helbide elektronikoa, baimenak eta saioa hasteko segurtasun-datu esentzialak soilik gordetzen ditu.",
      scopeTitle: "Uneko sarbide-esparrua",
      scopeDesc:
        "Zure kontura sartu diren aplikazioak ikus ditzakezu Baimendutako aplikazioetan eta edozein unetan indargabetu ditzakezu.",
      statusTitle: "Kontuaren egoera",
      statusDesc:
        "Kontua izoztuta badago, saioa hastea blokeatuko da administratzaile batek konpondu arte.",
      deleteTitle: "Ezabatu kontua",
      deleteDesc:
        "7 egunetan berriro saioa hasten baduzu, ezabatzeko eskaera automatikoki bertan behera utziko da. Bestela, kontua eta baimen-datuak ezabatuko dira.",
      deleteWarningPrimary:
        "Kontua ezabatzea itzulezina da. Egin babeskopia kontu honekin lotutako datu guztiena lehenik.",
      deleteWarningSecondary:
        "Eskaera bidali ondoren, 7 egunetan berriro saioa hasteak ezabatzea bertan behera utziko du. 7 egunetan saioa hasten ez baduzu, sistemak automatikoki ezabatuko ditu kontua eta baimen-datuak.",
      deleteAction: "Irakurri dut eta ondorioak onartzen ditut",
      passwordVerifyTitle: "Egiaztatu uneko pasahitza",
      passwordVerifyDesc:
        "Sartu zure uneko saioa hasteko pasahitza eta osatu helbide elektronikoaren egiaztapena. Telefono-zenbaki bat lotuta badago, telefono-egiaztapena ere eskatzen da.",
      emailVerifyCode: "Helbide elektronikoaren egiaztapen-kodea",
      emailVerifyCodePlaceholder: "Sartu zure helbide elektronikoan bidalitako 6 digituko kodea",
      sendDeleteEmailCode: "Bidali helbide elektronikoaren kodea",
      sendDeleteEmailCodeSuccess:
        "Helbide elektronikoaren egiaztapen-kodea bidali da. Begiratu zure sarrera-ontzia.",
      sendDeleteEmailCodeFailed: "Helbide elektronikoaren egiaztapen-kodea bidaltzeak huts egin du",
      phoneVerifyCode: "Telefono-egiaztapenaren kodea",
      phoneVerifyCodePlaceholder: "Sartu zure telefonora bidalitako 6 digituko kodea",
      sendDeletePhoneCode: "Bidali telefono-kodea",
      sendDeletePhoneCodeSuccess:
        "Telefono-egiaztapenaren kodea bidali da. Begiratu zure telefonoa.",
      sendDeletePhoneCodeFailed: "Telefono-egiaztapenaren kodea bidaltzeak huts egin du",
      confirmDeleteNow: "Bidali ezabatzeko eskaera",
      deleteSuccess:
        "Ezabatzeko eskaera bidali da. 7 egunetan saioa hasteak bertan behera utziko du.",
      deleteFailed: "Ezabatzeko eskaera bidaltzeak huts egin du",
      deletePendingAt:
        "Ezabatzeko eskaera bidali da. Ezabatzeko data programatua: {{date}}",
    },
    bindings: {
      title: "Baimendutako aplikazioak",
      appId: "Aplikazioaren izena",
      scopes: "Esparruak",
      createdAt: "Baimenduta",
      authorizedAt: "Baimenduta",
      status: "Egoera",
      action: "Ekintza",
      viewDetails: "Xehetasunak",
      detailTitle: "Baimenaren xehetasunak",
      siteName: "Baimendutako gunea",
      requestedPermissions: "Emandako baimenak",
      accessStatus: "Sarbide-egoera",
      reason: "Arrazoia",
      effectiveAt: "Indarrean sartzeko data",
      expiresAt: "Iraungitze-data",
      accessStatusNormal: "Aktiboa",
      accessStatusRestricted: "Mugatua",
      accessStatusBanned: "Blokeatua",
      scopeOpenIdTitle: "Berretsi zure nortasuna",
      scopeOpenIdDesc:
        "Saioa hasitako kontua benetan zurea dela berresteko eta oinarrizko saioa hasteko saioa ezartzeko erabiltzen da.",
      scopeProfileTitle: "Sartu zure profil publikora",
      scopeProfileDesc:
        "Ezizena, avatarraren irudia eta beste profil publikoko datu batzuk aplikazioan erakusteko barne hartzen ditu.",
      scopeEmailTitle: "Sartu zure helbide elektronikoaren helbidera",
      scopeEmailDesc:
        "Zure kontuaren helbide elektronikoa erakusteko edo jakinarazpenak bidaltzeko eta zure kontua lotzeko erabiltzen da beharrezkoa denean.",
      scopePhoneTitle: "Sartu zure telefono-zenbakira",
      scopePhoneDesc:
        "Kontuaren ezagutza, jakinarazpenak edo segurtasun-egiaztapena egiteko erabiltzen da beharrezkoa denean.",
      scopeGatewayReadTitle: "Sartu babestutako negozio-APIetara",
      scopeGatewayReadDesc:
        "Aplikazioari baimentzen dio baimena eman ondoren zure izenean babestutako API baliabideetara sartzeko.",
      scopeCustomTitle: "Eskatutako baimena: {{scope}}",
      scopeCustomDesc:
        "Aplikazio honek negozio-baimen gehigarri bat eskatzen du. Berrikusi arretaz jarraitu aurretik.",
      revoke: "Indargabetu",
      batchRevoke: "Taldekan indargabetzea",
      batchRevokeConfirmTitle: "Berretsi taldekan indargabetzea?",
      batchRevokeConfirmDesc:
        "{{count}} baimen hautatu dira. Aplikazio hauek berriro baimena eskatu beharko dute.",
    },
    help: {
      title: "Laguntza zentroa",
      loginIssueTitle: "Ezin da saioa hasi",
      loginIssueDesc:
        "Saioa hasi ezin baduzu, lehenik ziurtatu konturako metodo egokia erabiltzen ari zarela, hala nola pasahitza, helbide elektronikoaren kodea, telefono-kodea edo sarbide-gakoa. Egiaztapen-kode bat baztertu bada, ziurtatu berriena dela eta oraindik baliozkoa dela. Kontua izoztuta, aktibazioaren zain edo bestela mugatuta agertzen bada, arazoa plataformaren administratzaile batek konpondu behar du. Kontua ezabatzeko eskaera berriki bidali baduzu, sistemak ezabatzeko berrespena edo telefono-lotura eskatu dezake sarbidea berreskuratu aurretik.",
      protectTitle: "Babestu zure kontua",
      protectDesc:
        "Gaitu bi faktoreko autentifikazioa ahalik eta lasterren eta lotu sarbide-gakoak gailu fidagarrietan pasahitzaren bidezko konpromisoaren arriskua murrizteko. Ez partekatu inoiz helbide elektronikoaren kodeak, SMS kodeak edo MFA kodeak hirugarrenekin eta ez sartu berriro kredentzialak konfiantzarik ez duzun orrietan. Kontu bera gailu askotan erabiltzen baduzu, berrikusi maiz azken saioak, lotutako sarbide-gakoak eta baimendutako aplikazioak, eta kendu jada erabiltzen ez dituzun gailuak edo baimenak.",
      authIssueTitle: "Baimen-arazoak",
      authIssueDesc:
        "Aplikazio bat ezezaguna badirudi, esparru arraroak eskatzen baditu edo zure kontua abusuan ari dela susmatzen baduzu, ireki Baimendutako aplikazioak baimenaren ordua, emandako esparruak eta integrazioaren xehetasunak berrikusteko, eta indargabetu berehala beharrezkoa bada. Indargabetu ondoren, aplikazioak ezin izango ditu baliabide babestuak zure kontuarekin atzitu berriro saioa hasi eta baimen-eskaera berri bat onartu arte. Arazoak aplikazio bat baino gehiago kontu osoa kaltetu baditzake, zure pasahitza aldatu, zure MFA ezarpenak egiaztatu eta azken saioak eta sarbide-gakoen jarduera berrikusi beharko zenituzke.",
      contactTitle: "Jarri gurekin harremanetan",
      contactDesc:
        "Laguntza eskuz behar baduzu, plataformaren laguntza-kontaktura jo dezakezu behean. Arazo bat jakinaraztean, sartu kontuaren helbide elektronikoa, arazoa gertatu zen ordua, errore-mezuen pantaila-argazkiak, erabiltzen ari zinen saioa hasteko metodoa eta gailu edo arakatzailearen xehetasun garrantzitsuak arazoa azkarrago ikertu ahal izateko.",
      contactMainlandTitle: "Txinako Herrialdea",
      contactOverseasTitle: "Atzerria",
      contactPersonLabel: "Harremanetarako pertsona:",
      contactPhoneLabel: "Telefonoa:",
      contactEmailLabel: "Helbide elektronikoa:",
      contactHoursLabel: "Laguntza-ordutegia:",
      contactMainlandPersonValue: "YOUR_NAME",
      contactMainlandPhoneValue: "YOUR_PHONE_NUMBER",
      contactMainlandEmailValue: "YOUR_EMAIL",
      contactMainlandHoursValue: "Astelehenetik ostiralera 09:00 - 18:00",
      contactOverseasPersonValue: "Eman behar",
      contactOverseasPhoneValue: "Eman behar",
      contactOverseasEmailValue: "Eman behar",
      contactOverseasHoursValue: "Astelehenetik ostiralera 09:00 - 18:00",
      contactRegionNotice:
        "Jarri harremanetan lehenik zure eskualdeko laguntza-kanalarekin. Zein eskualde aplikatzen den ziur ez bazaude, hasi Txinako Herrialdeko kontaktuarekin birbideratze-laguntza lortzeko.",
      contactNotice:
        "Kontu izoztuak, baimen arraroak, galdutako sarbide-gakoak edo ezabatzeko berreskurapen bezalako arazoetarako, jarri harremanetan lehenik administratzailearekin goiko telefono-zenbaki edo helbide elektronikoaren bidez. Zure plataformak txartel-sistema ofiziala, iragarki-taula edo operazio-taldea ematen badu, jarraitu kanal ofizial hori lehenik.",
    },
  },
} as const;

export default locale;
