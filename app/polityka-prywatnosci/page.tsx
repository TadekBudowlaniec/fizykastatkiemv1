import type { Metadata } from 'next';
import { PageHero } from '@/components/ui/PageHero';
import { Container } from '@/components/ui/Container';

export const metadata: Metadata = {
  title: 'Polityka prywatności',
  description:
    'Polityka prywatności i plików cookies fizykastatkiem.pl - zasady przetwarzania danych osobowych zgodnie z RODO.',
  alternates: { canonical: '/polityka-prywatnosci/' },
};

export default function PolitykaPage() {
  return (
    <>
      <PageHero
        eyebrow="Dokumenty"
        title="Polityka prywatności i plików cookies"
        subtitle="Zasady ochrony danych osobowych zgodnie z RODO"
        crumbs={[
          { label: 'Start', href: '/' },
          { label: 'Polityka prywatności' },
        ]}
        size="sm"
      />
      <section className="bg-cloud py-14 sm:py-20">
        <Container size="narrow">
          <div className="prose-fs rounded-3xl border border-line bg-white p-7 shadow-soft sm:p-10">
            <p>
              Korzystanie ze strony internetowej oraz platformy kursowej pod
              adresem https://fizykastatkiem.pl oznacza akceptację poniższych
              warunków Polityki Prywatności i Polityki Cookies.
            </p>
            <p>
              Celem niniejszej Polityki jest wyjaśnienie, w jaki sposób
              przetwarzane są Twoje dane osobowe, komu są powierzane oraz jakie
              masz prawa.
            </p>

            <h3>§1 Postanowienia ogólne</h3>
            <ol>
              <li>
                Administratorem danych osobowych zbieranych za pośrednictwem
                strony internetowej https://fizykastatkiem.pl jest Cezary Prusak,
                zamieszkały przy ul. Pszennej 4/25, Lublin (zwany dalej
                „Administratorem”).
              </li>
              <li>
                Kontakt z Administratorem możliwy jest poprzez adres e-mail:
                fizykastatkiem@gmail.com.
              </li>
              <li>
                Dane osobowe przetwarzane są zgodnie z Rozporządzeniem Parlamentu
                Europejskiego i Rady (UE) 2016/679 (RODO).
              </li>
              <li>
                Administrator dokłada szczególnej staranności w celu ochrony
                interesów osób, których dane dotyczą, a w szczególności zapewnia,
                że zbierane przez niego dane są przetwarzane zgodnie z prawem.
              </li>
            </ol>

            <h3>§2 Cel i podstawa przetwarzania danych</h3>
            <p>Twoje dane osobowe przetwarzane są w następujących celach:</p>
            <ol>
              <li>
                Świadczenie usług drogą elektroniczną (Konto Użytkownika) - w
                celu umożliwienia Ci rejestracji, logowania oraz dostępu do
                zakupionych kursów.
                <br />
                <em>
                  Podstawa prawna: Niezbędność do wykonania umowy (art. 6 ust. 1
                  lit. b RODO).
                </em>
              </li>
              <li>
                Realizacja zamówień (Sprzedaż) - w celu obsłużenia procesu zakupu
                kursu oraz przyjęcia płatności.
                <br />
                <em>
                  Podstawa prawna: Niezbędność do wykonania umowy (art. 6 ust. 1
                  lit. b RODO).
                </em>
              </li>
              <li>
                Realizacja obowiązków prawnych - np. wystawianie
                faktur/rachunków oraz prowadzenie księgowości.
                <br />
                <em>
                  Podstawa prawna: Obowiązek prawny ciążący na Administratorze
                  (art. 6 ust. 1 lit. c RODO).
                </em>
              </li>
              <li>
                Komunikacja techniczna i systemowa - wysyłanie powiadomień
                dotyczących Twojego konta (np. potwierdzenie rejestracji, reset
                hasła, potwierdzenie zakupu).
                <br />
                <em>
                  Podstawa prawna: Niezbędność do wykonania umowy (art. 6 ust. 1
                  lit. b RODO).
                </em>
              </li>
              <li>
                Ustalenie, dochodzenie lub obrona przed roszczeniami - w celach
                archiwalnych i dowodowych.
                <br />
                <em>
                  Podstawa prawna: Prawnie uzasadniony interes Administratora
                  (art. 6 ust. 1 lit. f RODO).
                </em>
              </li>
            </ol>

            <h3>§3 Odbiorcy danych (technologia)</h3>
            <p>
              Aby zapewnić funkcjonowanie strony, autoryzację użytkowników oraz
              sprzedaż kursów, Administrator korzysta z usług zewnętrznych
              dostawców. Twoje dane mogą być powierzane następującym podmiotom:
            </p>
            <ol>
              <li>
                Netlify (Netlify, Inc., USA) - dostawca usług hostingowych
                (serwera), na którym znajduje się strona. Netlify może
                przetwarzać dane takie jak adres IP w logach serwera w celu
                zapewnienia bezpieczeństwa i stabilności strony.
              </li>
              <li>
                Supabase (Supabase, Inc., USA/Singapur) - dostawca bazy danych
                oraz systemu autoryzacji. To tutaj przechowywane są Twoje dane
                logowania (e-mail, zaszyfrowane hasło) oraz informacje o Twoim
                koncie.
              </li>
              <li>
                Brevo (dawniej Sendinblue, Francja) - dostawca systemu
                mailingowego. Twój adres e-mail jest przekazywany do Brevo
                wyłącznie w celu wysyłki wiadomości transakcyjnych (np. link
                aktywacyjny, reset hasła) niezbędnych do funkcjonowania serwisu.
              </li>
              <li>
                Stripe (Stripe, Inc., USA/Irlandia) - operator płatności. W
                przypadku zakupu kursu, dane niezbędne do realizacji transakcji
                są przetwarzane przez Stripe. Administrator nie przechowuje
                pełnych danych Twojej karty płatniczej.
              </li>
              <li>
                Biuro rachunkowe / System księgowy - podmioty wspierające
                Administratora w realizacji obowiązków podatkowych (jeśli
                dotyczy).
              </li>
            </ol>
            <p>
              <strong>Przekazywanie danych poza EOG:</strong> W związku z
              korzystaniem z usług takich jak Netlify, Supabase czy Stripe, Twoje
              dane mogą być przekazywane poza Europejski Obszar Gospodarczy
              (głównie do USA). Podmioty te gwarantują odpowiedni poziom ochrony
              danych poprzez stosowanie standardowych klauzul umownych
              zatwierdzonych przez Komisję Europejską lub uczestnictwo w
              programach ochrony prywatności (Data Privacy Framework).
            </p>

            <h3>§4 Prawa użytkownika</h3>
            <p>
              Przysługują Ci następujące prawa związane z przetwarzaniem danych
              osobowych:
            </p>
            <ol>
              <li>Prawo dostępu do treści swoich danych.</li>
              <li>Prawo do sprostowania (poprawiania) danych.</li>
              <li>
                Prawo do usunięcia danych (prawo do bycia zapomnianym) - w
                przypadkach przewidzianych przez prawo.
              </li>
              <li>Prawo do ograniczenia przetwarzania danych.</li>
              <li>Prawo do wniesienia sprzeciwu wobec przetwarzania danych.</li>
              <li>Prawo do przenoszenia danych.</li>
              <li>
                Prawo wniesienia skargi do organu nadzorczego (Prezesa Urzędu
                Ochrony Danych Osobowych), jeśli uznasz, że przetwarzanie narusza
                przepisy RODO.
              </li>
            </ol>
            <p>
              Aby skorzystać z powyższych praw, skontaktuj się z Administratorem
              pod adresem: fizykastatkiem@gmail.com.
            </p>

            <h3>§5 Pliki cookies i logi serwera</h3>
            <ol>
              <li>
                <strong>Pliki Cookies (Ciasteczka):</strong> Strona wykorzystuje
                pliki cookies, które są niezbędne do jej prawidłowego działania, w
                szczególności:
                <ul>
                  <li>
                    Cookies sesyjne/autoryzacyjne: Umożliwiające Ci pozostanie
                    zalogowanym w serwisie (obsługiwane przez Supabase).
                  </li>
                  <li>
                    Cookies bezpieczeństwa i płatności: Używane przez operatora
                    Stripe w celu zapobiegania oszustwom i realizacji płatności.
                  </li>
                </ul>
              </li>
              <li>
                Ponieważ strona nie korzysta z narzędzi marketingowych i
                analitycznych (jak Google Analytics czy Facebook Pixel), nie
                stosujemy cookies śledzących Twoją aktywność w celach
                reklamowych.
              </li>
              <li>
                <strong>Logi serwera:</strong> Korzystanie ze strony wiąże się z
                przesyłaniem zapytań do serwera (Netlify). Zapytania te są
                zapisywane w logach serwera (adres IP, data i czas, informacje o
                przeglądarce). Dane te nie są kojarzone z konkretnymi osobami i
                służą wyłącznie do administrowania serwerem oraz zapewnienia
                bezpieczeństwa.
              </li>
            </ol>

            <h3>§6 Okres przechowywania danych</h3>
            <ol>
              <li>
                Dane związane z Kontem Użytkownika przechowywane są przez czas
                posiadania konta w serwisie.
              </li>
              <li>
                Dane związane z transakcjami (zakupami) przechowywane są przez
                okres wymagany przepisami prawa podatkowego (zazwyczaj 5 lat od
                końca roku kalendarzowego).
              </li>
              <li>
                W przypadku usunięcia konta, dane mogą być przechowywane przez
                okres przedawnienia ewentualnych roszczeń.
              </li>
            </ol>

            <h3>§7 Zmiany w polityce prywatności</h3>
            <p>
              Administrator zastrzega sobie prawo do wprowadzania zmian w Polityce
              Prywatności. Zmiany mogą wynikać z rozwoju technologii internetowej,
              zmian w prawie lub wdrożenia nowych narzędzi (np. analitycznych). O
              istotnych zmianach Użytkownicy zostaną poinformowani.
            </p>
            <p>
              <strong>Data ostatniej aktualizacji: 09.12.2025</strong>
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
