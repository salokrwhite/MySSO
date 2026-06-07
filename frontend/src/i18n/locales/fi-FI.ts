const locale = {
  translation: {
    header: {
      language: "Vaihda kieli",
      languageModalTitle: "Valitse kieli",
      languageModalDesc: "Valitse käyttöliittymän kieli, jota haluat käyttää.",
      agreement: "Käyttäjäehtos",
      privacy: "Tietosuojakäytäntö",
      help: "Ohjauskeskus",
      logout: "Kirjaudu ulos",
      accountCenter: "Tilin hallinta",
    },
    captcha: {
      securityVerification: "Turvatarkistus",
      refresh: "Päivitä",
      imageCaptcha: "Kuvateksti CAPTCHA",
      imageCaptchaRequired: "Syötä kuvateksti CAPTCHA",
    },
    legal: {
      back: "Palaa etusivulle",
      updatedAt: "Viimeksi päivitetty: {{date}}",
      agreement: {
        title: "Käyttäjäehtos",
        updatedAt: "2026-06-16",
        intro:
          "Tervetuloa {{siteName}}-palveluun. Ennen kuin rekisteröidyt, kirjaudut sisään, integroitu tai käytät järjestelmän tarjoamaa yhtenäistä tunnistautumispotentiaalia, sinun tulee lukea tämä sopimus huolellisesti. Jatkamalla käyttöä hyväksyt noudattavasi tämän sopimuksen ehtoja.",
        sections: {
          accountTitle: "1. Tili ja kirjautuminen",
          accountP1:
            "Sinun tulee提供ä todellista, laillista ja yhteyttä mahdollistavaa rekisteröintitietoja ja huolehtia tilisi, salasanasi, vahvistuskoodisi ja muiden kirjautumistodennusaineistojen turvallisuudesta. Olet vastuussa riskeistä ja menetyksistä, jotka johtuvat huonosta todennusaineistojen hallinnasta.",
          accountP2:
            "Jos järjestelmässä havaittiin poikkeava kirjautuminen, sallimaton käyttö, tilin sulkeminen tai tietoturva-riskejä, alusta voi toteuttaa turvallisuusmeasures, kuten toisen tason todentamisen, kirjautumisen rajoittamisen tai tilin sulkemisen.",
          acceptableUseTitle: "2. Sallittu käyttö",
          acceptableUseP1:
            "Et saa käyttää tätä järjestelmää mitenkään laittomaan toimintaan, muiden oikeuksien loukkaamiseen, järjestelmän vakauden haittaamiseen tai turvallisuuskontrollien kiertämiseen, mukaan lukien muttei rajoittuen huijausrekisteröinti, tunnistustietojen väärinkäyttö, massapyynnöt tai rajapintojen ylimääräinen käyttö.",
          acceptableUseP2:
            "Jos rikkonut tätä sopimusta tai liittyviä sääntöjä, alusta voi keskeyttää tai lopettaa osan tai kaikkia palveluidesi käyttöoikeuksia ja pidättää oikeuden periä vastuun tarvittaessa.",
          authorizationTitle: "3. Suostumus ja kolmannen osapuolen sovellukset",
          authorizationP1:
            "Kun käyttät {{siteName}}-tiliä kirjautuaksesi kolmannen osapuolen sovellukseen, järjestelmä pyytää suostumustasi suostumus sivulla näytettävien oikeuksien perusteella. Voit hyväksyä tai peruuttaa suostumuksesi milloin tahansa tilin hallinnassa.",
          authorizationP2:
            "Kolmannen osapuolen sovelluksen käyttäytyminen datan käytössä suostumuksen jälkeen on sen oman palveluehtojen ja tietosuojakäytännön alaisuudessa. Alusta vastaa vain lainsäädännön vaatimaa vastuutason mukaan.",
          developerTitle: "4. Kehittäjän integrointi",
          developerP1:
            "Kehittäjän on varmistettava, että sovelluksen tiedot, uudelleenohjausosoitteet, pyydetyt oikeudet ja liiketoimintatavoitteet ovat todellisia, täydellisiä ja jatkuvasti voimassa olevia, eikä hän saa huijata käyttäjiä.",
          developerP2:
            "Alusta voi tarkastaa, hylätä, poistaa tai rajoittaa integroituja sovelluksia ylläpitääkseen yhtenäisen tunnistautumiseekosysteemin vakautta ja turvallisuutta.",
          liabilityTitle: "5. Palvelun muutokset ja vastuuvapaus",
          liabilityP1:
            "Turvallisuus-, sääntely-, operaatio- tai ylläpitusehtoihin perustuen alusta voi tarkistaa, päivittää, keskeyttää tai lopettaa tiettyjä rajapintoja, suoritustapoja tai toimintoja ja yrittää ilmoittaa muutoksista tarvittaessa.",
          liabilityP2:
            "Lain sallimassa rajoissa alusta ei vastaa lakisääteisten velvoitteiden ylittäviä katkoksia, epänormaaleja tietoja tai menetyksiä, jotka johtuvat luonnonkatastrofeista, verkkovirheistä, kolmannen osapuolen syistä tai sinun omasta väärinkäytöstä.",
accountP3:
            "Käyttäjä- ja kehittäjätilien suojaamiseksi alusta voi suorittaa riskinarviointeja skenaarioissa, kuten salasanakirjautuminen, koodikirjautuminen, passkey-kirjautuminen, QR-koodikirjautuminen, puhelinnumeron liittäminen, sähköpostin vaihto, puhelinnumeron vaihto, salasanan vaihto, MFA-asetukset, tilin poisto, tietojen vienti ja kehittäjäsovellusten hallinta. Tuloksesta riippuen alusta voi vaatia lisävahvistusta, viivästyttää käsittelyä, rajoittaa toimintoa tai estää pääsyn.",
        },
      },
      privacy: {
        title: "Tietosuojakäytäntö",
        updatedAt: "2026-06-16",
        intro:
          "{{siteName}} arvostaa henkilötietojasi ja tilin turvallisuutta. Tämä käytäntö selittää, miten keräämme, käytämme, tallennamme, jaetaan ja suojamme tietojasi, sekä millaisia oikeuksia sinulla on.",
        sections: {
          dataCollectionTitle: "1. Keräämämme tiedot",
          dataCollectionP1:
            "Kun rekisteröidyt, kirjaudut sisään tai käytät tilapalveluita, voimme kerätä rekisteröinti maasi, sähköpostiosoitteesi, puhelinnumerosi, salasanan tiivisteen, kirjautumisistunnot, laitteen IP-osoitteen, suostumusrekisteröinnit ja tarvittavat turvallisuuslokit.",
          dataCollectionP2:
            "Kun lataat profiilikuvaa, muutat profiiliasi, kiinnität puhelinnumeron, ottaa kaksivaiheisen todentamisen käyttöön tai annat suostumuksen kolmannen osapuolen sovellukselle, käsittelemme sinun lähettämiäsi tietoja funktion tarpeiden mukaan.",
dataCollectionP3:
            "Tilin kaappaamisen, credential stuffingin, epänormaalien laitteiden, epänormaalien verkkojen, automatisoitujen pyyntöjen ja korkean riskin toimintojen tunnistamiseksi voimme myös kerätä tai tuottaa laitteen sormenjälkiä, laitteen julkisen avaimen tunnisteita, asiakastyypin, laitteen riskisignaaleja, kirjautumisvirheiden syitä, koodivahvistusten tuloksia, IP-alueen tai alueellisia riskimerkintöjä, kirjautumishistoriaa, riskipisteitä, riskitasoja ja toteutettuja toimenpiteitä. Emme kerää tilejä koskevan riskinhallinnan tarkoituksiin yhteystietoja, SMS-sisältöä, puhelulokeja, valokuva-albumeita, tarkkaa sijaintia, mikrofonin tai kameran sisältöä.",
          dataUsageTitle: "2. Tietojen käyttö",
          dataUsageP1:
            "Käytämme相关 tietoja tilin rekisteröimiseen, kirjautumistodentamiseen, vahvistuskoodin lähettämiseen, riskienhallintaan, suostumuksen vahvistamiseen, kehittäjän sovellusten tarkastamiseen, tilin turvallisuusilmoituksiin ja palvelun luotettavuuden ylläpitämiseen.",
          dataUsageP2:
            "Analysoimme myös lokitietoja ja tilastoja minimivaatimuksen perusteella havaitsemme poikkeavia toimintamalleja, parantaaksemme tuotekokemusta ja vahvistaaksemme turvallisuutta.",
dataUsageP3:
            "Riskinhallintatietoja käytetään pääasiassa päättämään, sallitaanko kirjautuminen tai arkaluonteisten toimintojen jatkaminen, vaaditaanko lisävahvistusta sähköpostilla tai tekstiviestillä, vaaditaanko puhelinnumeron liittämistä, käynnistetäänkö epäonnistuneiden yritysten lukitus, kirjataanko riskitapahtuma, tai auttamaan ylläpitäjiä tutkimaan tietoturvaongelmia. Asiakkaan ilmoittamia riskitietoja käytetään vain apusignaalina, eikä niitä käytetä yksinään tietoturvapäätösten lieventämiseen.",
          dataSharingTitle: "3. Jakaminen ja paljastaminen",
          dataSharingP1:
            "Annamme kolmannen osapuolen sovelluksille henkilöllisyystietoja tai oikeuksiin liittyviä tietoja vain, kun annat suostumuksen suostumus sivulla näytetyille oikeuksille.",
          dataSharingP2:
            "Lainsäädännön, valvontaviranomaisten vaatimusten, julkisen edun suojelun tai järjestelmän turvallisuuden tarpeiden lisäksi emme myy tai laittomasti jaa henkilötietojasi epäsuhteellisten kolmannen osapuolten kanssa.",
          userRightsTitle: "4. Sinun oikeutesi",
          userRightsP1:
            "Voit tarkastella ja päivittää profiiliasi, kiinnityksiä, suostumusrekisteröintejä ja turvallisuusasetuksia tilin hallinnassa, ja voit peruuttaa sovellusten suostumukset tai esittää tilin poistopyynnön.",
          userRightsP2:
            "Jos uskot, että tietojasi on käsitelty virheellisesti, väärin tai tarpeettomasti, voit ottaa yhteyttä alustan operaatööriin tai käyttää lakisääteisiä oikeuksiasi.",
          securityTitle: "5. Suojaus ja säilyttäminen",
          securityP1:
            "Käytämme pääsynvalvontaa, salasanan tiivistämistä, vahvistuskoodin vanhenemista, tarkastuslokeja ja datan minimoimista suojataksemme henkilötietojasi ja tunnistautumistietojasi.",
          securityP2:
            "Lainsäädännön ja liiketoiminnan vaatimusten alaisena säilytämme tietojasi vain niin pitkään kuin palvelun tarkoituksen saavuttaminen edellyttää; tilin poistamisen tai säilytysajan päättymisen jälkeen poistamme tai anonyymisoimme tiedot käytäntönmukaisesti.",
securityP3:
            "Riskilokit, kirjautumishistoria, laiteprofiilit ja epäonnistuneiden yritysten tiedot säilytetään tietoturvatarkastusten, riitojen ratkaisun, hyökkäystutkimusten ja vaatimustenmukaisuuden edellyttämän ajan. Pienennämme vuoto- ja väärinkäytön riskejä hajautuksella, pääsynhallinnalla, vähimmäisoikeuksilla ja tarkastuslokeilla.",
        },
      },
    },
    auth: {
      noAccount: "Ei tiliä?",
      registerNow: "Rekisteröidy nyt",
      registerPageTitle: "Luo tili",
      registerPageSubtitle:
        "Valmis rekisteröinti maasi, sähköpostiosoitteesi ja sähköpostivahvistuskoodillasi.",
      registerDisabled: "Rekisteröinti on tällä hetkellä estetty",
      registerSuccess:
        "Rekisteröinti onnistui. Kirjaudu sisään salasanallasi.",
      phoneBindingRequiredAfterRegister:
        "Rekisteröinti onnistui. Kiinnitä ensin puhelinnumero aktivoidaksesi tilin.",
      registerFailed: "Rekisteröinti epäonnistui",
      country: "Maa",
      countryRequired: "Valitse maa",
      registerCode: "Sähköpostikoodi",
      registerCodeRequired: "Syötä sähköpostivahvistuskoodi",
      registerCodePlaceholder: "Syötä 6-numeroinen koodi",
      sendRegisterCode: "Lähetä koodi",
      sendRegisterCodeSuccess:
        "Vahvistuskoodi on lähetetty. Tarkista sähköpostisi.",
      sendRegisterCodeFailed: "Vahvistuskoodin lähettäminen epäonnistui",
      legalConsentPrefix: "Olen lukenut ja hyväksyn",
      legalConsentAnd: "ja",
      accountAgreement: "Tilin käyttöehdot",
      accountPrivacyPolicy: "Tilin tietosuojakäytäntö",
      legalConsentRequired: "Lue ja hyväksy Tilin käyttöehdot ja Tilin tietosuojakäytäntö",
      backToLoginWithAccount: "Onko sinulla jo tili? Kirjaudu sisään",
      forgotPassword: "Unohtuiko salasana?",
      forgotPasswordPageTitle: "Palauta salasana",
      forgotPasswordPageSubtitle:
        "Palauta kirjautumissalasana rekisteröitymisesi sähköpostilla ja vahvistuskoodilla.",
      forgotPasswordPrompt: "Unohtuiko salasana?",
      forgotPasswordAction: "Palauta se",
      forgotPasswordDesc:
        "Kun olet vahvistanut sähköpostisi koodilla, voit asettaa suoraan uuden kirjautumissalasanan.",
      forgotPasswordHint:
        "Syötä rekisteröitymisesi sähköposti, vahvistuskoodi ja uusi salasana. Voit kirjautua heti uudella salasanalla lähettämisen jälkeen.",
      goToOtpLogin: "Käytä sähköpostikoodilla kirjautumista",
      resetCode: "Palautuskoodi",
      sendResetCode: "Lähetä palautuskoodi",
      sendResetCodeSuccess:
        "Palautuskoodi on lähetetty. Tarkista sähköpostisi.",
      sendResetCodeFailed: "Palautuskoodin lähettäminen epäonnistui",
      resetPassword: "Palauta salasana",
      resetPasswordSuccess:
        "Salasana palautettu onnistuneesti. Kirjaudu sisään uudella salasanallasi.",
      resetPasswordFailed: "Salasanan palauttaminen epäonnistui",
      newPassword: "Uusi salasana",
      confirmNewPassword: "Vahvista uusi salasana",
      newPasswordPlaceholder: "Syötä vähintään 8 merkkiä sisältävä salasana",
      confirmPassword: "Vahvista salasana",
      confirmPasswordPlaceholder: "Syötä salasana uudelleen",
      backToLogin: "Palaa kirjautumiseen",
      emailRequired: "Syötä sähköpostisi",
      passwordRequired: "Syötä salasanasi",
      otpCodeRequired: "Syötä sähköpostivahvistuskoodi",
      phoneRequired: "Syötä puhelinnumerosi",
      phoneOtpCodeRequired: "Syötä tekstiviestivahvistuskoodi",
      emailInvalid: "Syötä kelvollinen sähköpostiosoite",
      resetCodeRequired: "Syötä palautuskoodi",
      resetCodePlaceholder: "Syötä 6-numeroinen palautuskoodi",
      newPasswordRequired: "Syötä uusi salasana",
      confirmNewPasswordRequired: "Vahvista uusi salasana uudelleen",
      newPasswordMinLength: "Uuden salasanan on oltava vähintään 8 merkkiä",
      passwordMinLength: "Salasanan on oltava vähintään 8 merkkiä",
      newPasswordMismatch: "Uudet salasanat eivät vastaa toisiaan",
      passwordMismatch: "Salasanat eivät vastaa toisiaan",
      registrationClosed: "Rekisteröinti on tällä hetkellä suljettu",
      login: "Kirjaudu sisään",
      passkeyLogin: "Passkey",
      passkeyLoginDesc:
        "Käytä passkeyä, joka on jo kiinnitetty tälle sivustolle laitteellasi tai järjestelmätunnuksellasi.",
      passkeyLoginButton: "Käytä passkeyä",
      passkeyLoginHint:
        "Sinun on kiinnitettävä passkey tilin hallinnassa ennen kuin voit käyttää sitä täällä.",
      passkeyLoginSuccess: "Passkey lisätty onnistuneesti",
      passkeyNotAvailable:
        "Tällä laitteella ei ole käytettävissä passkeyä tälle sivustolle. Käytä toista kirjautumistapaa.",
      qrLogin: "QR-koodi",
      qrLoginDesc: "Kirjaudu sisään skannaamalla QR-koodi MySSO Android -sovelluksella.",
      qrLoginScanned: "Skannattu. Vahvista kirjautuminen mobiilisovelluksessa.",
      qrLoginScannedMask: "Tämä QR-koodi on jo skannattu",
      qrLoginCancelled: "Tämä QR-kirjautuminen peruttiin",
      qrLoginExpired: "QR-koodi on vanhentunut. Päivitä.",
      qrLoginRefresh: "Päivitä QR-koodi",
      downloadApp: "Lataa sovellus",
      passwordLogin: "Salasana",
      otpLogin: "Sähköpostikoodi",
      phoneOtpLogin: "Puhelinkoodi",
      email: "Sähköposti",
      phone: "Puhelinnumero",
      password: "Salasana",
      otpCode: "Sähköpostikoodi",
      phoneOtpCode: "Tekstiviestikoodi",
      mfaCode: "2FA-koodi",
      mfaPlaceholder: "Jätä tyhjäksi, jos kaksivaiheista todentamista ei ole käytössä",
      sendOtpCode: "Lähetä sähköpostikoodi",
      sendOtpCodeSuccess:
        "Sähköpostikoodi on lähetetty. Tarkista sähköpostisi.",
      sendOtpCodeFailed: "Vahvistuskoodin lähettäminen epäonnistui",
      sendOtpCodeEmailRequired: "Syötä sähköpostisi ennen koodin pyytämistä",
      sendPhoneOtpCode: "Lähetä tekstiviestikoodi",
      sendPhoneOtpCodeSuccess:
        "Tekstiviestikoodi on lähetetty. Tarkista puhelimesi.",
      sendPhoneOtpCodeFailed: "Tekstiviestikoodin lähettäminen epäonnistui",
      sendPhoneBindingCode: "Lähetä kiinnityskoodi",
      sendPhoneBindingCodeSuccess:
        "Puhelinnumeron kiinnityskoodi on lähetetty. Tarkista puhelimesi.",
      sendPhoneBindingCodeFailed: "Puhelinnumeron kiinnityskoodin lähettäminen epäonnistui",
      securityCaptcha: "Turvallisuustarkistus",
      securityCaptchaPlaceholder:
        "Syötä turvallisuustarkistuksen arvo ja yritä uudelleen",
      securityCaptchaHelp:
        "Kun nykyinen laite tai IP lähettää kyselyitä liian nopeasti, suorita tämä turvallisuustarkistus ennen uuden koodin pyytämistä.",
      securityCaptchaRequiredTip:
        "Kyselymäärä on suuri. Suorita turvallisuustarkistus ennen uuden koodin pyytämistä.",
      sendOtpCodePhoneRequired:
        "Syötä puhelinnumerosi ennen koodin pyytämistä",
      phoneBindingPageTitle: "Kiinnitä puhelinnumero",
      phoneBindingRegisterDesc:
        "Tämä tili on törmännyt rekisteröinnin jälkeiseen riskisääntöön. Kiinnitä puhelinnumero ennen jatkamista.",
      phoneBindingLoginDesc:
        "Tämä tili on törmännyt kirjautumisen riskisääntöön. Kiinnitä puhelinnumero ennen jatkamista.",
      completePhoneBinding: "Kiinnitä ja jatka",
      phoneBindingSuccess:
        "Puhelinnumero kiinnitetty onnistuneesti. Tili on taas aktiivinen.",
      mfaVerifyTitle: "Kaksivaiheinen todentaminen",
      mfaVerifyEmailHint:
        "Vahvistuskoodi lähetettiin {{target}}. Syötä se jatkaaksesi kirjautumista.",
      mfaVerifyPhoneHint:
        "Vahvistuskoodi lähetettiin {{target}}. Syötä se jatkaaksesi kirjautumista.",
      loginStepUpTitle: "Lisätodentaminen kirjautumiseen",
      loginStepUpEmailDesc:
        "Tämä kirjautuminen vaatii lisäsähköpostitodentamista. Koodi lähetetään {{email}}.",
      loginStepUpSMSDesc:
        "Tämä kirjautuminen vaatii lisäpuhelintodentamista. Koodi lähetetään {{phone}}.",
      loginStepUpDualDesc:
        "Tämä kirjautuminen vaatii sekä sähköposti- että puhelintodentamista. Sähköposti: {{email}}, puhelin: {{phone}}.",
      loginStepUpExpired:
        "Lisätodentamissessio on vanhentunut. Kirjaudu sisään uudelleen.",
      forcedMfaEnrollmentTitle: "Kaksivaiheisen todentamisen aktivointi on pakollista",
      forcedMfaEnrollmentDesc:
        "Ylläpitäjä vaatii, että tämä tili aktivoi kaksivaiheisen todentamisen ennen tämän kirjautumisen valmistumista.",
      forcedMfaEnrollmentExpired:
        "Pakollisen MFA-registraation sessio on vanhentunut. Kirjaudu sisään uudelleen.",
      completeForcedMfaEnrollment: "Aktivoi ja jatka",
      cancelForcedMfaEnrollment: "Peruuta ja palaa kirjautumiseen",
      verifyAndLogin: "Tarkista ja kirjaudu sisään",
      deletionConfirmTitle: "Tilin poistopyyntö lähetetty",
      deletionConfirmScheduledAt: "Suunniteltu poistoaika: {{date}}",
      deletionConfirmDesc:
        "Kirjautuminen uudelleen peruuttaa poistamisen.",
      deletionConfirmContinue: "Jatka ja peruuta poistaminen",
      deletionConfirmExpired: "Vahvistus on vanhentunut, kirjaudu sisään uudelleen",
      deletionConfirmFailed: "Vahvistus epäonnistui, kirjaudu sisään uudelleen",
      logoutProgressTitle: "Kirjaudutaan ulos",
      logoutProgressDesc:
        "Henkilöllisyysistunto on tyhjennetty ja yhdistetyt sovellukset kirjataan ulos.",
      loginFailed: "Kirjautuminen epäonnistui",
      oidcCallbackFailed: "OIDC-callback epäonnistui",
      appRejected: "Sovellus hylätty",
      appRejectedWithReason: "Sovellus hylätty: {{reason}}",
      appNotFound: "Sovellusta ei löytynyt",
      accessDenied: "Pääsy estetty",
      tokenExchangeFailed: "Tokenin vaihtaminen epäonnistui",
      authorize: {
        title: "Kirjaudu {{appName}}-sovellukseen {{siteName}}-tilillä",
        desc: "Tämä sovellus pyytää seuraavia tietoja ja oikeuksia. Vahvistamisen jälkeen palaat liiketoimintasovellukseen valmiiksi kirjauduttua.",
        chooseAccountTitle: "Olet jo kirjautunut {{siteName}}-tilillä",
        chooseAccountDesc:
          "Valitse, haluatko jatkaa nykyisellä tilillä tai kirjautua ensin toisella tilillä.",
        currentAccountFallback: "Nykyinen tili",
        useCurrentAccount: "Jatka tällä tilillä",
        useAnotherAccount: "Kirjaudu toisella tilillä",
        permissionTitle: "Pyydetyt oikeudet",
        permissionCount: "{{count}} kohdetta",
        agreement:
          "Olen lukenut ja hyväksyn yllä olevien oikeuksien myöntämisen",
        confirm: "Vahvista ja jatka",
        cancel: "Peruuta ja palaa kirjautumiseen",
        errors: {
          applicationRejected: "Sovellus hylätty",
          applicationRejectedWithReason: "Sovellus hylätty: {{reason}}",
          applicationAccessRestricted: "Sovelluksen pääsy rajoitettu",
          applicationAccessBanned: "Sovelluksen pääsy estetty",
          applicationAccessBannedWithReason: "Sovelluksen pääsy estetty: {{reason}}",
          applicationNotApproved: "Sovellus ei ole hyväksytty",
          applicationNotFound: "Sovellusta ei löytynyt",
          forbidden: "Sinulla ei ole oikeutta päästä tähän sovellukseen",
          unsupportedResponseType: "Vastaus tyyppi ei ole tuettu",
          redirectUriMismatch: "Uudelleenohjaus URI ei täsmää",
          scopeNotAllowed: "Pyydetty oikeusalue ei ole sallittu",
          openidScopeRequired: "OpenID-alue on pakollinen",
          codeChallengeMethodRequiresCodeChallenge: "Code challenge on pakollinen, kun code_challenge_method on annettu",
          unsupportedCodeChallengeMethod: "Code challenge menetelmä ei ole tuettu",
          promptNoneMustNotBeCombinedWithOtherValues: "Prompt-arvo none ei voi yhdistää muihin arvoihin",
          invalidMaxAge: "Max_age arvo on virheellinen",
          acrValuesNotSatisfied: "Nykyinen kirjautumisistunto ei täytä pyydettyjä todentamiskontekstivaatimuksia",
          consentRequired: "Lisäsuostumus vaaditaan",
          loginRequired: "Kirjaudu sisään jatkaaksesi",
          authorizeFailed: "Valtuutus epäonnistui. Yritä uudelleen.",
          loadAuthorizationSettingsFailed: "Valtuutussääntöjen lataaminen epäonnistui",
          networkRequestFailed: "Verkkopyyntö epäonnistui. Tarkista verkkoyhteys ja yritä uudelleen.",
          apiReturnedHtml: "Valtuutusservice palautti odottamattoman sivun. Tarkista API tai reverse proxy asetukset.",
        },
        scopes: {
          openidTitle: "Vahvista henkilöllisyytesi",
          openidDesc:
            "Käytetään vahvistamaan, että nykyinen kirjautunut tili kuuluu sinulle, ja perustamaan peruskirjautumisistunto.",
          profileTitle: "Käytä julkista profiilisi",
          profileDesc:
            "Sisältää näyttönimesi, profiilikuvaasi ja muita julkisia profiilitietoja sovelluksen esittämistä varten.",
          emailTitle: "Käytä sähköpostitietojasi",
          emailDesc:
            "Käytetään tilin sähköpostin näyttämiseen tai ilmoitusten ja tilin kiinnittämisen tukemiseen tarvittaessa.",
          phoneTitle: "Käytä puhelinnumerotietojasi",
          phoneDesc:
            "Käytetään tilin tunnistamiseen, ilmoitusten lähettämiseen tai turvallisuustodentamiseen tarvittaessa.",
          gatewayReadTitle: "Käytä suojattuja liiketoimintarajapintoja",
          gatewayReadDesc:
            "Sallii sovelluksen käyttää suojattuja resursseja valtuutetun henkilöllisyytesi kautta.",
          customTitle: "Pyydetty oikeus: {{scope}}",
          customDesc:
            "Tämä sovellus pyytää lisäliiketoimintaoikeutta. Tarkista se huolellisesti ennen jatkamista.",
        },
      },
      sessionConflict: {
        title: "Erilaisia tilejä havaittiin selaimessasi",
        desc: "Tämä ikkuna muistaa tiliä, joka ei vastaa selaimen nykyistä aktiivista tiliä. Samassa selaimessa voi olla vain yksi päätili aktiivisena kerrallaan. Valitse tili, jolla haluat jatkaa.",
        browserAccount: "Selaimen aktiivinen tili",
        thisWindowAccount: "Tämän ikkunan aiempi tili",
        useBrowserAccount: "Käytä selaimen aktiivista tiliä",
        useThisWindowAccount: "Vaihda takaisin tämän ikkunan tilille",
        relogin: "Kirjaudu ulos ja kirjaudu sisään uudelleen",
      },
    },
    nav: {
      security: "Kirjautuminen ja turvallisuus",
      profile: "Profiili",
      privacy: "Tietosuoja",
      bindings: "Valtuutetut sovellukset",
      help: "Ohjauskeskus",
    },
    common: {
      loadingFailed: "Lataus epäonnistui",
      revokeFailed: "Suostumuksen peruuttaminen epäonnistui",
      revokeSuccess: "Suostumus peruutettu",
      confirm: "Vahvista",
      sendCode: "Lähetä koodi",
      sendCodeSuccess: "Vahvistuskoodi lähetetty onnistuneesti",
      sendingCode: "Lähetetään",
      save: "Tallenna",
      saving: "Tallennetaan",
      edit: "Muokkaa",
      cancel: "Peruuta",
      uploadAvatar: "Lataa profiilikuva",
      avatarUpdated: "Profiilikuva päivitetty",
      avatarUploadFailed: "Profiilikuvan lataus epäonnistui",
      profileUpdated: "Profiili päivitetty",
      profileUpdateFailed: "Profiilin päivittäminen epäonnistui",
      imageReadFailed: "Kuvan lukeminen epäonnistui",
      imageProcessUnsupported:
        "Kuvan käsittelyä ei tueta tässä selaimessa",
      avatarConvertFailed: "Profiilikuvan muuntaminen epäonnistui",
      unset: "Ei asetettu",
      unsetShort: "Ei asetettu",
      notFilled: "Ei täytetty",
      noRecord: "Ei tietoja",
      normal: "Aktiivinen",
      accountCenter: "Tilin hallinta",
      noAuthorizedApps: "Ei valtuutettuja sovelluksia",
    },
    errors: {
      applicationDisabled: "Tämä sovellus on poistettu käytöstä",
      emailRequiredByServer: "Syötä sähköpostisi",
      passwordRequiredByServer: "Syötä salasanasi",
      invalidCredentials: "Tili tai todennusaineisto on virheellinen",
      invalidOtpCode: "Vahvistuskoodi on virheellinen tai vanhentunut",
      accountFrozen: "Tämä tili on jäädytetty",
      accountFrozenWithReason:
        "Tämä tili on jäädytetty. Syy: {{reason}}",
      userNotFound: "Käyttäjää ei löytynyt",
      smsNotConfigured: "Tekstiviestin lähetys ei ole määritetty",
      smtpNotConfigured: "Sähköpostin lähetys ei ole määritetty",
      userStatusInvalid:
        "Nykyinen tilan tila ei salli tätä toimintoa",
      invalidCurrentPhoneVerificationCode:
        "Nykyisen puhelinnumeron vahvistuskoodi on virheellinen tai vanhentunut",
      invalidNewPhoneVerificationCode:
        "Uuden puhelinnumeron vahvistuskoodi on virheellinen tai vanhentunut",
      currentPhoneVerificationCodeRequired:
        "Syötä nykyisen puhelinnumeron vahvistuskoodi",
      currentPhoneNotBound:
        "Tälle tilille ei ole kiinnitetty puhelinnumeroa",
      phoneDoesNotMatchCurrentBoundPhone:
        "Puhelinnumero ei vastaa tällä hetkellä kiinnitettyä numeroa",
      phoneAlreadyBound: "Tämä puhelinnumero on jo kiinnitetty",
      newPhoneMustBeDifferent:
        "Uuden puhelinnumeron on oltava eri kuin nykyinen",
      phoneAndVerificationCodeRequired:
        "Syötä puhelinnumero ja uuden puhelinnumeron vahvistuskoodi",
      invalidMfaCode: "Kaksivaiheisen todentamisen koodi on virheellinen tai vanhentunut",
      unsupportedMfaMethod: "Tukea ei ole kaksivaiheiselle todentamismenetelmälle",
      mfaNotEnabled:
        "Kaksivaiheista todentamista ei ole käytössä tällä tilillä",
      emailNotBound: "Tälle tilille ei ole kiinnitetty sähköpostia",
      phoneNotBound: "Tälle tilille ei ole kiinnitetty puhelinnumeroa",
      emailVerificationCodeRequired: "Syötä sähköpostivahvistuskoodi",
      invalidEmailVerificationCode:
        "Sähköpostivahvistuskoodi on virheellinen tai vanhentunut",
      phoneVerificationCodeRequired: "Syötä puhelinnumeron vahvistuskoodi",
      invalidPhoneVerificationCode:
        "Puhelinnumeron vahvistuskoodi on virheellinen tai vanhentunut",
      newPasswordMustBeDifferentFromCurrentPassword:
        "Uuden salasanan on oltava eri kuin nykyinen salasana",
      phoneBindingChallengeExpired:
        "Puhelinnumeron kiinnityssessio on vanhentunut. Kirjaudu sisään tai rekisteröidy uudelleen.",
      manualMfaCodeNotSendable:
        "Tämä tili käyttää manuaalista MFA-koodia, eikä koodia voi lähettää",
      emailAndPasswordRequired:
        "Syötä sähköpostisi ja salasanasi ennen kaksivaiheisen koodin pyytämistä",
      mfaChallengeExpiredOrInvalid:
        "Kaksivaiheisen todentamisen sessio on vanhentunut. Kirjaudu sisään uudelleen.",
      challengeRequired:
        "Suorita turvallisuustarkistus ennen koodin pyytämistä.",
      captchaRequired:
        "Kyselymäärä on suuri. Suorita ensin turvallisuustarkistus.",
      circuitOpen:
        "Lähetyskanava on väliaikaisesti suojattu. Yritä myöhemmin uudelleen.",
      cooldownActive:
        "Tämä kohde on pyytänyt koodia liian usein. Yritä myöhemmin uudelleen.",
      passkeyChallengeExpired: "Passkey-sessio on vanhentunut. Yritä uudelleen.",
      passkeyVerificationFailed:
        "Passkey-todentaminen epäonnistui. Yritä uudelleen tai käytä toista kirjautumistapaa.",
      passkeyAlreadyExists: "Tämä passkey on jo kiinnitetty.",
      passkeyNotFound: "Passkeyä ei löytynyt.",
      passkeyBrowserUnsupported:
        "Tämä selain tai laite ei tue passkeyjä.",
      passkeyUserHandleInvalid:
        "Passkeyä vastaavaa tiliä ei voitu tunnistaa.",
      invalidLoginStepUpVerificationCode:
        "Lisätodentamisen koodi on virheellinen tai vanhentunut.",
      loginStepUpChallengeExpiredOrInvalid:
        "Lisätodentamisen sessio on vanhentunut. Kirjaudu sisään uudelleen.",
      mfaEnrollmentChallengeExpiredOrInvalid:
        "Pakollisen MFA-registraation sessio on vanhentunut. Kirjaudu sisään uudelleen.",
      noAvailableMfaMethodForCurrentAccount:
        "Tälle tilille ei ole saatavilla MFA-menetelmää.",
      noAvailableLoginVerificationTargetForCurrentAccount:
        "Tälle tilille ei ole saatavilla lisätodentamisen kohdetta.",
    },
    security: {
      loginMethods: "Kirjautumistavat",
      phone: "Kiinnitä puhelinnumero",
      phoneDesc:
        "Käytetään lisäkirjautumistapoihin, tekstiviestitodentamiseen ja tilin turvallisuusilmoituksiin",
      bindPhone: "Kiinnitä",
      bindPhoneTitle: "Kiinnitä puhelinnumero",
      bindPhoneHint:
        "Vahvista puhelinnumero ennen kiinnittämistä. Vahvistuskoodi lähetetään tähän puhelinnumeroon.",
      rebindPhoneHint:
        "Puhelinnumeron vaihtamiseksi vahvista ensin nykyinen puhelinnumero ja sitten uusi numero.",
      currentPhone: "Nykyinen kiinnitetty puhelinnumero",
      currentPhoneCode: "Nykyisen puhelinnumeron vahvistuskoodi",
      currentPhoneCodePlaceholder:
        "Syötä 6-numeroinen koodi, joka lähetettiin nykyiseen puhelinnumeroon",
      sendCurrentPhoneCode: "Lähetä nykyisen puhelinnumeron koodi",
      newPhone: "Puhelinnumero",
      newPhoneCode: "Uuden puhelinnumeron vahvistuskoodi",
      newPhonePlaceholder: "Syötä puhelinnumero, esimerkiksi 13800138000",
      smsCode: "Tekstiviestivahvistuskoodi",
      smsCodePlaceholder: "Syötä 6-numeroinen tekstiviestikoodi",
      safeEmail: "Turvallinen sähköposti",
      safeEmailDesc: "Ensisijainen todennusaineisto kirjautumiseen",
      editEmailTitle: "Vaihda turvallinen sähköposti",
      newEmail: "Uusi sähköposti",
      newEmailPlaceholder: "Syötä uusi sähköpostiosoite",
      emailCode: "Sähköpostikoodi",
      emailCodePlaceholder: "Syötä 6-numeroinen koodi",
      changeEmailHint:
        "Uusi sähköposti on vahvistettava ennen muutoksen tallentamista.",
      changePassword: "Vaihda salasana",
      changePasswordDesc:
        "Päivitä kirjautumissalasana säännöllisesti parantaaksesi tilin turvallisuutta",
      editPasswordTitle: "Vaihda kirjautumissalasana",
      currentPassword: "Nykyinen salasana",
      currentPasswordPlaceholder: "Syötä nykyinen salasana",
      currentPasswordIncorrect: "Nykyinen salasana on virheellinen",
      newPassword: "Uusi salasana",
      newPasswordPlaceholder: "Syötä uusi vähintään 8 merkkiä sisältävä salasana",
      confirmPassword: "Vahvista uusi salasana",
      confirmPasswordPlaceholder: "Syötä uusi salasana uudelleen",
      changePasswordHint:
        "Käytä seuraavalla kirjautumiskerralla uutta salasanaa, ja vältä vanhan salasanan käyttämistä.",
      passwordMinLength: "Salasanan on oltava vähintään 8 merkkiä",
      passwordMismatch: "Uudet salasanat eivät vastaa toisiaan",
      passwordUpdated: "Salasana päivitetty",
      passwordUpdateFailed: "Salasanan päivittäminen epäonnistui",
      mfa: "Kaksivaiheinen todentaminen",
      mfaDesc: "Kun käytössä, kirjautuminen vaatii lisätodentamista",
      mfaTitle: "Määritä kaksivaiheinen todentaminen",
      mfaHint: "Valitse toinen todentamistapa, jota käytetään kirjautumisen aikana.",
      mfaTitleEnable: "Aktivoi kaksivaiheinen todentaminen",
      mfaTitleDisable: "Poista kaksivaiheinen todentaminen",
      mfaHintEnable:
        "Valitse toinen todentamistapa, jota käytetään kirjautumisen aikana.",
      mfaHintDisable:
        "Poistamisen jälkeen kirjautuminen ei enää vaadi lisätodentamista.",
      mfaMethod: "Todentamistapa",
      mfaMethodEmail: "Sähköpostikoodi",
      mfaMethodSMS: "Puhelinkoodi",
      passkeys: "Passkey",
      passkeysDesc:
        "Kiinnittämisen jälkeen voit kirjautua suoraan järjestelmän passkey-valitsimesta.",
      addPasskey: "Lisää passkey",
      deletePasskey: "Poista passkey",
      passkeyName: "Laite nimi",
      passkeyNamePlaceholder: "Syötä tunnistettava nimi",
      passkeyLastUsed: "Viimeksi käytetty",
      passkeyLastUsedIP: "Viimeksi käytetty IP",
      passkeyCreatedAt: "Luotu",
      passkeyEmpty: "Ei kiinnitettyjä passkeyjä",
      passkeyManageVerify:
        "Tilin turvallisuuden takaamiseksi vahvista nykyiset todennusaineistosi ennen passkeyjen lisäämistä tai poistamista.",
      currentMfaCode: "Nykyinen MFA-koodi",
      currentMfaCodePlaceholder: "Syötä nykyisen MFA-menetelmän koodi",
      currentMfaCodeHintEmail:
        "Täytä vahvistus nykyisellä kiinnitetyllä sähköpostikoodilla ennen tallentamista.",
      currentMfaCodeHintSMS:
        "Täytä vahvistus nykyisellä kiinnitetyllä puhelinkoodilla ennen tallentamista.",
      currentMfaCodeHintManual:
        "Syötä nykyinen manuaalisesti määritetty MFA-koodi ennen tallentamista.",
      accountSecurity: "Tilin turvallisuus",
      recentLogin: "Viimeksi kirjautuminen",
      recentLoginDesc: "Viimeinen onnistunut kirjautumisaika ja laitteen IP",
    },
    profile: {
      title: "Profiili",
      avatar: "Profiilikuva",
      avatarDesc:
        "Kuva leikataan automaattisesti keskelle ja muunnetaan webp-formaatiksi",
      nickname: "Näyttönimi",
      nicknameDesc: "Nykyinen näyttönimi",
      gender: "Sukupuoli",
      genderDesc: "Tämän tilin profiilin sukupuolitiedot",
      languagePreference: "Kielivalinta",
      languagePreferenceDesc:
        "Kirjautumisen jälkeen tämä kieli käytetään ensisijaisesti sivun sisällön näyttämiseen",
      languagePreferenceSaved: "Kielivalinta tallennettu",
      languagePreferenceSaveFailed: "Kielivalinnan tallentaminen epäonnistui",
      genderMale: "Mies",
      genderFemale: "Nainen",
      genderOther: "Muu",
      userId: "Käyttäjä-ID",
      userIdDesc: "Tämän tilin uniikki tunniste järjestelmässä",
      nicknamePlaceholder: "Syötä näyttönimi",
      editNicknameTitle: "Muokkaa näyttönimeä",
      editGenderTitle: "Muokkaa sukupuolta",
      email: "Sähköpostiosoite",
      emailDesc: "Käytetään kirjautumiseen, todentamiseen ja turvallisuusilmoituksiin",
      createdAt: "Rekisteröity",
      createdAtDesc: "Aika, jolloin tämä tili luotiin",
      country: "Rekisteröintimaa",
      countryDesc: "Rekisteröinnin yhteydessä rekisteröity maa tai alue",
    },
    privacy: {
      title: "Tietosuoja",
      exportTitle: "Lataa käyttäjädata",
      exportDesc:
        "Vie profiilitiedot ja peruuttamattomat valtuutetut sovellukset CSV-formaatissa.",
      exportAction: "Lataa data",
      exportPasswordVerifyDesc:
        "Vahvista nykyinen kirjautumissalasana ennen lataamista. CSV sisältää profiilitiedot ja peruuttamattomat valtuutetut sovellukset.",
      exportSuccess: "Käyttäjädatojen lataus aloitettu",
      exportFailed: "Käyttäjädatojen vienti epäonnistui",
      minimizeTitle: "Dataminimointi",
      minimizeDesc:
        "Järjestelmä säilyttää vain rekisteröintimaan, sähköpostin, suostumukset ja välttämättömät kirjautumisturvallisuustiedot.",
      scopeTitle: "Nykyinen pääsyala",
      scopeDesc:
        "Voit tarkastella sovelluksia, jotka ovat saaneet pääsyn tilillesi Valtuutetut sovellukset -sivulla ja peruuttaa ne milloin tahansa.",
      statusTitle: "Tilin tila",
      statusDesc:
        "Jos tili on jäädytetty, kirjautuminen estetään, kunnes ylläpitäjä ratkaisee asian.",
      deleteTitle: "Poista tili",
      deleteDesc:
        "Jos kirjaudut sisään 7 päivän kuluessa, poistopyyntö peruutetaan automaattisesti. Muussa tapauksessa tili ja suostumusdata poistetaan.",
      deleteWarningPrimary:
        "Tilin poistaminen on peruuttamaton toimenpide. Tee ennen sitä varmuuskopiiointi tilisi liittyvistä tiedoista.",
      deleteWarningSecondary:
        "Pyynnön lähettämisen jälkeen kirjautuminen 7 päivän kuluessa peruuttaa poistamisen. Jos et kirjaudu sisään 7 päivän kuluessa, järjestelmä poistaa tilin ja suostumusdatan automaattisesti.",
      deleteAction: "Olen lukenut ja hyväksyn seuraukset",
      passwordVerifyTitle: "Vahvista nykyinen salasana",
      passwordVerifyDesc:
        "Syötä nykyinen kirjautumissalasana ja suorita sähköpostitodentaminen. Jos puhelinnumero on kiinnitetty, myös puhelintodentaminen on vaadittu.",
      emailVerifyCode: "Sähköpostivahvistuskoodi",
      emailVerifyCodePlaceholder: "Syötä 6-numeroinen koodi, joka lähetettiin sähköpostiisi",
      sendDeleteEmailCode: "Lähetä sähköpostikoodi",
      sendDeleteEmailCodeSuccess:
        "Sähköpostivahvistuskoodi on lähetetty. Tarkista sähköpostisi.",
      sendDeleteEmailCodeFailed: "Sähköpostivahvistuskoodin lähettäminen epäonnistui",
      phoneVerifyCode: "Puhelinnumeron vahvistuskoodi",
      phoneVerifyCodePlaceholder: "Syötä 6-numeroinen koodi, joka lähetettiin puhelimeesi",
      sendDeletePhoneCode: "Lähetä puhelinkoodi",
      sendDeletePhoneCodeSuccess:
        "Puhelinnumeron vahvistuskoodi on lähetetty. Tarkista puhelimesi.",
      sendDeletePhoneCodeFailed: "Puhelinnumeron vahvistuskoodin lähettäminen epäonnistui",
      confirmDeleteNow: "Lähetä poistopyyntö",
      deleteSuccess:
        "Poistopyyntö lähetetty. Kirjautuminen 7 päivän kuluessa peruuttaa sen.",
      deleteFailed: "Poistopyynnön lähettäminen epäonnistui",
      deletePendingAt:
        "Poistopyyntö lähetetty. Suunniteltu poistoaika: {{date}}",
    },
    bindings: {
      title: "Valtuutetut sovellukset",
      appId: "Sovelluksen nimi",
      scopes: "Oikeudet",
      createdAt: "Valtuutettu",
      authorizedAt: "Valtuutettu",
      status: "Tila",
      action: "Toiminto",
      viewDetails: "Tarkastele yksityiskohtia",
      detailTitle: "Valtuutuksen yksityiskohdat",
      siteName: "Valtuuttava sivusto",
      requestedPermissions: "Myönnetyt oikeudet",
      accessStatus: "Käyttöoikeuden tila",
      reason: "Syy",
      effectiveAt: "Voimaantulopäivämäärä",
      expiresAt: "Vanhenemispäivämäärä",
      accessStatusNormal: "Aktiivinen",
      accessStatusRestricted: "Rajoitettu",
      accessStatusBanned: "Estetty",
      scopeOpenIdTitle: "Vahvista henkilöllisyytesi",
      scopeOpenIdDesc:
        "Käytetään vahvistamaan, että kirjautunut tili on todella sinun, ja perustamaan peruskirjautumisistunto.",
      scopeProfileTitle: "Käytä julkista profiilisi",
      scopeProfileDesc:
        "Sisältää näyttönimesi, profiilikuvaasi ja muita julkisia profiilitietoja sovelluksen sisäiseen näyttämiseen.",
      scopeEmailTitle: "Käytä sähköpostiosoitteesi",
      scopeEmailDesc:
        "Käytetään tilin sähköpostin näyttämiseen tai ilmoitusten lähettämiseen ja tilin kiinnittämiseen tarvittaessa.",
      scopePhoneTitle: "Käytä puhelinnumerosi",
      scopePhoneDesc:
        "Käytetään tilin tunnistamiseen, ilmoitusten lähettämiseen tai turvallisuustodentamiseen tarvittaessa.",
      scopeGatewayReadTitle: "Käytä suojattuja liiketoimintarajapintoja",
      scopeGatewayReadDesc:
        "Sallii sovelluksen käyttää suojattuja API-resursseja puolestasi valtuutuksen jälkeen.",
      scopeCustomTitle: "Pyydetty oikeus: {{scope}}",
      scopeCustomDesc:
        "Tämä sovellus pyytää lisäliiketoimintaoikeutta. Tarkista se huolellisesti ennen jatkamista.",
      revoke: "Peruuta",
      batchRevoke: "Peruuta ryhmässä",
      batchRevokeConfirmTitle: "Vahvista ryhmäperuutus?",
      batchRevokeConfirmDesc:
        "Valittu {{count}} valtuutusta. Näiden sovellusten on haettava uutta suostumusta.",
    },
    help: {
      title: "Ohjauskeskus",
      loginIssueTitle: "Ei voida kirjautua",
      loginIssueDesc:
        "Jos et voi kirjautua sisään, varmista ensin, että käytät oikeaa tapausta tilillesi, kuten salasanaa, sähköpostikoodia, puhelinkoodia tai passkeyä. Jos vahvistuskoodi hylätään, varmista, että se on uusin koodi ja edelleen voimassa. Jos tili näytetään jäädytetyltä, aktivoinnin odottavaksi tai muuten rajoitetuksi, asiaa on käsiteltävä alustan ylläpitäjän toimesta. Jos olet hiljattain lähettänyt tilin poistopyynnön, järjestelmä saattaa myös vaatia poistovahvistusta tai puhelinnumeron kiinnittämistä ennen pääsyn palauttamista.",
      protectTitle: "Suojaa tilisi",
      protectDesc:
        "Aktivoi kaksivaiheinen todentaminen mahdollisimman pian ja kiinnitä passkeyja luotettaviin laitteisiin vähentääksesi pelkoa ainoastaan salasanan rikkomisesta. Älä koskaan jaa sähköpostikoodia, tekstiviestikoodia tai MFA-koodia kolmansille osapuolille, eikä syötä todennusaineistoja epäilyttävissä sivuissa. Jos käytät samaa tiliä useissa laitteissa, tarkista säännöllisesti viimeisimmät kirjautumiset, kiinnitetyt passkey ja valtuutetut sovellukset, ja poista laitteet tai valtuutukset, joita et enää käytä.",
      authIssueTitle: "Valtuutusongelmat",
      authIssueDesc:
        "Jos sovellus näyttää epäilyttävältä, pyytää epäilyttäviä oikeuksia tai epäilet tilisi väärinkäyttöä, avaa Valtuutetut sovellukset -sivu, tarkista sovelluksen valtuutusaika, myönnetyt oikeudet ja integrointitiedot, ja peruuta se välittömästi tarvittaessa. Peruuttamisen jälkeen sovellus ei enää voi käyttää tilillesi suojattuihin resursseihin, kunnes kirjaudut siihen uudelleen ja hyväksyt uuden suostumuspyynnön. Jos ongelma saattaa vaikuttaa koko tiliin sen sijaan, että vain yhteen sovellukseen, sinun tulisi myös vaihtaa salasana, tarkistaa MFA-asetuksesi ja tarkistaa viimeisimmät kirjautumis- ja passkey-aktiviteetit.",
      contactTitle: "Ota yhteyttä",
      contactDesc:
        "Jos tarvitset manuaalista tukea, voit ottaa yhteyttä alla olevaan alustan tukipersonaaliin. Kun ilmoitat ongelmasta, sisällytä tilisi sähköposti, ongelman esiintymisaika, virheilmoitusten kuvakaappaukset, käytämä kirjautumistapa ja relevantit laite- tai selainyksityiskohdat, jotta ongelma voidaan tutkia nopeammin.",
      contactMainlandTitle: "Kiina",
      contactOverseasTitle: "Ulkomaiset",
      contactPersonLabel: "Yhteyshenkilö:",
      contactPhoneLabel: "Puhelin:",
      contactEmailLabel: "Sähköposti:",
      contactHoursLabel: "Asiakaspalveluajat:",
      contactMainlandPersonValue: "YOUR_NAME",
      contactMainlandPhoneValue: "YOUR_PHONE_NUMBER",
      contactMainlandEmailValue: "YOUR_EMAIL",
      contactMainlandHoursValue: "Maanantai - perjantai 09:00 - 18:00",
      contactOverseasPersonValue: "YOUR_NAME_Oversea",
      contactOverseasPhoneValue: "YOUR_PHONE_Oversea",
      contactOverseasEmailValue: "YOUR_EMAIL_Oversea",
      contactOverseasHoursValue: "Maanantai - perjantai 09:00 - 18:00",
      contactRegionNotice:
        "Ota ensin yhteyttä alueesi tukikanavaan. Jos et ole varma, mikä alue koskee sinua, aloita Kiinan pääkontaktin kanssa saadaksesi ohjausta.",
      contactNotice:
        "Jäädytetyistä tileistä, epänormaaleista valtuutuksista, kadonneista passkeyistä tai poistojen palauttamisesta aiheutuvien ongelmien tapauksessa ota ensin yhteyttä ylläpitäjään yllä olevan puhelinnumeron tai sähköpostin kautta. Jos alusta tarjoaa virallista tikettijärjestelmää, ilmoitussivua tai operatiivista ryhmää, noudata ensin tuota virallista kanavaa.",
    },
  },
} as const;

export default locale;
