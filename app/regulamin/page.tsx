import type { Metadata } from 'next';
import { PageHero } from '@/components/ui/PageHero';
import { Container } from '@/components/ui/Container';

export const metadata: Metadata = {
  title: 'Regulamin',
  description:
    'Regulamin sklepu internetowego i platformy kursowej fizykastatkiem.pl - zasady zakupu kursów, płatności, licencji oraz Gwarancji Zdanej Matury.',
  alternates: { canonical: '/regulamin/' },
};

export default function RegulaminPage() {
  return (
    <>
      <PageHero
        eyebrow="Dokumenty"
        title="Regulamin"
        subtitle="Sklep internetowy i platforma kursowa fizykastatkiem.pl"
        crumbs={[{ label: 'Start', href: '/' }, { label: 'Regulamin' }]}
        size="sm"
      />
      <section className="bg-cloud py-14 sm:py-20">
        <Container size="narrow">
          <div className="prose-fs rounded-3xl border border-line bg-white p-7 shadow-soft sm:p-10">
            <h2>
              Regulamin sklepu internetowego i platformy kursowej
              fizykastatkiem.pl
            </h2>

            <h3>§1 Postanowienia ogólne</h3>
            <p>
              Sklep internetowy dostępny pod adresem https://fizykastatkiem.pl
              prowadzony jest przez Cezarego Prusaka, zamieszkałego przy ul.
              Pszennej 4/25, Lublin (zwanego dalej „Sprzedawcą”).
            </p>
            <p>
              Kontakt ze Sprzedawcą możliwy jest za pośrednictwem adresu e-mail:
              fizykastatkiem@gmail.com.
            </p>
            <p>
              Niniejszy Regulamin określa zasady korzystania ze Sklepu,
              składania zamówień na Produkty cyfrowe (kursy online), zawierania
              umów sprzedaży, zasady „Gwarancji Zdanej Matury” oraz tryb
              postępowania reklamacyjnego.
            </p>
            <p>
              Warunkiem skorzystania ze Sklepu oraz zakupu kursu jest akceptacja
              postanowień niniejszego Regulaminu. Klient poprzez jego akceptację
              (zaznaczenie odpowiedniego pola przy zakupie) wyraża zgodę na
              wszystkie postanowienia i zobowiązuje się ich przestrzegać.
            </p>
            <p>
              Wszystkie ceny podane w Sklepie są cenami brutto (zawierają
              wszelkie należne podatki) i wyrażone są w polskich złotych.
            </p>
            <p>
              Informacje o produktach podane na stronach Sklepu nie stanowią
              oferty w rozumieniu Kodeksu Cywilnego, a są jedynie zaproszeniem do
              zawarcia umowy.
            </p>

            <h3>§2 Definicje</h3>
            <p>
              <strong>Sprzedawca</strong> - Cezary Prusak, zam. ul. Pszenna
              4/25, Lublin.
            </p>
            <p>
              <strong>Klient / Użytkownik</strong> - osoba fizyczna, osoba prawna
              lub jednostka organizacyjna dokonująca zakupów w Sklepie.
            </p>
            <p>
              <strong>Konsument</strong> - Klient będący osobą fizyczną
              dokonującą zakupów niezwiązanych bezpośrednio z jej działalnością
              gospodarczą lub zawodową.
            </p>
            <p>
              <strong>Sklep / Platforma</strong> - serwis internetowy dostępny
              pod adresem https://fizykastatkiem.pl.
            </p>
            <p>
              <strong>Produkt / Produkt Elektroniczny</strong> - treści cyfrowe
              (kursy wideo, materiały PDF, dostęp do platformy edukacyjnej)
              dostępne w Sklepie, będące przedmiotem Umowy Sprzedaży.
            </p>
            <p>
              <strong>Konto Użytkownika</strong> - indywidualny panel dostępny
              dla Klienta po zalogowaniu, w którym udostępniane są zakupione
              Produkty.
            </p>
            <p>
              <strong>Operator Płatności</strong> - serwis Stripe (Stripe, Inc.),
              za pośrednictwem którego realizowane są płatności.
            </p>
            <p>
              <strong>Umowa Sprzedaży</strong> - umowa zawarta na odległość
              pomiędzy Sprzedawcą a Klientem, której przedmiotem jest zakup
              Produktu.
            </p>

            <h3>§3 Wymagania techniczne</h3>
            <ul>
              <li>Urządzenie z dostępem do Internetu (komputer, tablet, smartfon).</li>
              <li>
                Aktualna przeglądarka internetowa (np. Chrome, Firefox, Safari,
                Edge).
              </li>
              <li>Aktywne konto poczty e-mail.</li>
              <li>Włączona obsługa plików Cookies i JavaScript w przeglądarce.</li>
            </ul>
            <p>
              Sprzedawca nie ponosi odpowiedzialności za problemy techniczne
              leżące po stronie sprzętu lub łącza internetowego Klienta, które
              utrudniają korzystanie z serwisu.
            </p>

            <h3>§4 Składanie zamówień i płatności</h3>
            <p>
              Klient składa zamówienie poprzez wybór Produktu na stronie,
              założenie konta (lub zalogowanie się) i kliknięcie przycisku
              finalizującego zakup.
            </p>
            <p>
              Warunkiem złożenia zamówienia jest podanie prawdziwych danych oraz
              akceptacja Regulaminu i Polityki Prywatności.
            </p>
            <p>Zamówienia można składać 24 godziny na dobę, 7 dni w tygodniu.</p>
            <p>
              Dostępną formą płatności są szybkie płatności internetowe (karta
              płatnicza, przelewy online, BLIK) obsługiwane przez operatora
              Stripe.
            </p>
            <p>
              Umowa Sprzedaży zostaje zawarta z chwilą skutecznego dokonania
              płatności przez Klienta.
            </p>
            <p>
              Po dokonaniu płatności, Klient otrzymuje na podany adres e-mail
              potwierdzenie zakupu.
            </p>

            <h3>§5 Dostawa produktu elektronicznego</h3>
            <p>
              Dostawa Produktu odbywa się wyłącznie drogą elektroniczną i jest
              wolna od dodatkowych opłat.
            </p>
            <p>
              Dostęp do zakupionego kursu przyznawany jest automatycznie po
              zaksięgowaniu wpłaty.
            </p>
            <p>
              Klient uzyskuje dostęp do materiałów poprzez zalogowanie się na
              swoje Konto Użytkownika w serwisie fizykastatkiem.pl.
            </p>
            <p>
              W przypadku problemów z dostępem do materiałów po opłaceniu
              zamówienia, Klient powinien skontaktować się ze Sprzedawcą pod
              adresem: fizykastatkiem@gmail.com.
            </p>

            <h3>§6 Usługi świadczone drogą elektroniczną (konto)</h3>
            <p>
              Sprzedawca świadczy na rzecz Klienta usługi drogą elektroniczną
              polegające na prowadzeniu Konta Użytkownika, udostępnianiu
              zakupionych treści oraz wysyłce powiadomień systemowych.
            </p>
            <p>
              Konto Użytkownika jest usługą nieodpłatną (sam dostęp do panelu),
              świadczoną przez czas nieokreślony.
            </p>
            <p>
              Klient może w każdej chwili zrezygnować z posiadania Konta,
              kontaktując się ze Sprzedawcą. Usunięcie Konta wiąże się z utratą
              dostępu do zakupionych materiałów.
            </p>
            <p>
              Zakazane jest dostarczanie przez Klienta treści o charakterze
              bezprawnym oraz wykorzystywanie Konta do działań na szkodę
              Sprzedawcy.
            </p>

            <h3>§7 Prawa własności intelektualnej (licencja)</h3>
            <p>
              Wszystkie Produkty dostępne w Sklepie są utworami w rozumieniu
              ustawy o prawie autorskim i stanowią własność intelektualną
              Sprzedawcy.
            </p>
            <p>
              Z chwilą zakupu, Sprzedawca udziela Klientowi licencji niewyłącznej
              na korzystanie z Produktu.
            </p>
            <p>
              Licencja upoważnia do korzystania z Produktu wyłącznie na własny
              użytek osobisty Klienta.
            </p>
            <p>
              <strong>Zabrania się:</strong>
            </p>
            <ul>
              <li>Udostępniania danych do logowania osobom trzecim.</li>
              <li>
                Kopiowania, powielania, nagrywania i rozpowszechniania materiałów
                w jakiejkolwiek formie.
              </li>
              <li>Odsprzedawania dostępu do kursu.</li>
            </ul>
            <p>
              W przypadku wykrycia naruszenia (np. logowania z wielu lokalizacji
              wskazujące na współdzielenie konta), Sprzedawca ma prawo do
              natychmiastowej blokady Konta bez zwrotu środków.
            </p>

            <h3>§8 Odstąpienie od umowy (brak zwrotu ustawowego)</h3>
            <p>
              Zgodnie z art. 38 ustawy o prawach konsumenta, prawo do odstąpienia
              od umowy zawartej na odległość nie przysługuje Konsumentowi w
              odniesieniu do umów o dostarczanie treści cyfrowych, które nie są
              zapisane na nośniku materialnym, jeżeli spełnianie świadczenia
              rozpoczęło się za wyraźną zgodą Konsumenta przed upływem terminu do
              odstąpienia od umowy i po poinformowaniu go przez przedsiębiorcę o
              utracie prawa odstąpienia od umowy.
            </p>
            <p>
              Klient kupując kurs i uzyskując do niego natychmiastowy dostęp,
              wyraża zgodę na rozpoczęcie świadczenia usługi przed upływem 14 dni
              i przyjmuje do wiadomości utratę prawa do odstąpienia od umowy.
            </p>

            <h3>§9 Gwarancja „Zdana Matura” (zwrot warunkowy)</h3>
            <p>
              Niezależnie od wyłączenia prawa do odstąpienia od umowy opisanego w
              §8, Sprzedawca udziela Klientowi dobrowolnej, umownej gwarancji pod
              nazwą „Gwarancja Zdanej Matury”.
            </p>
            <p>
              Gwarancja polega na zwrocie 100% ceny zapłaconej za kurs w
              przypadku, gdy Klient nie uzyska pozytywnego wyniku (tj. uzyska
              poniżej 30% punktów) z egzaminu maturalnego z fizyki, do którego
              przygotowywał się przy użyciu Kursu.
            </p>
            <p>
              <strong>Warunki skorzystania z Gwarancji:</strong> Aby Klient mógł
              ubiegać się o zwrot środków, muszą zostać spełnione łącznie
              następujące warunki:
            </p>
            <p>
              a) Termin zakupu: Klient zakupił Kurs najpóźniej na 30 dni przed
              datą egzaminu maturalnego z fizyki w danym roku.
            </p>
            <p>
              b) Przepracowanie kursu: Klient zapoznał się z co najmniej 90%
              materiałów dostępnych w Kursie (obejrzał lekcje wideo, wykonał
              zadania) przed datą egzaminu maturalnego. Weryfikacja aktywności
              odbywa się automatycznie na podstawie logów systemowych platformy
              kursowej Sprzedawcy.
            </p>
            <p>
              c) Wynik egzaminu: Klient uzyskał wynik poniżej 30% w oficjalnym
              terminie maturalnym.
            </p>
            <p>
              <strong>Procedura zgłoszenia:</strong>
            </p>
            <p>
              a) Zgłoszenie chęci skorzystania z Gwarancji należy przesłać na
              adres e-mail: fizykastatkiem@gmail.com.
            </p>
            <p>
              b) Zgłoszenie musi wpłynąć w terminie do 30 dni od daty ogłoszenia
              oficjalnych wyników matur przez CKE.
            </p>
            <p>
              c) Do zgłoszenia należy dołączyć skan lub zdjęcie oficjalnego
              świadectwa/zaświadczenia wydanego przez OKE, potwierdzającego
              uzyskany wynik.
            </p>
            <p>
              Sprzedawca zweryfikuje zgłoszenie (w tym postępy w kursie) w
              terminie 14 dni. W przypadku pozytywnej weryfikacji, zwrot środków
              nastąpi tą samą metodą, którą dokonano płatności.
            </p>

            <h3>§10 Reklamacje (wady techniczne)</h3>
            <p>Sprzedawca ma obowiązek dostarczyć Produkt wolny od wad.</p>
            <p>
              W przypadku problemów technicznych z dostępem do kursu lub błędów w
              działaniu platformy, Klient ma prawo złożyć reklamację na adres
              e-mail: fizykastatkiem@gmail.com.
            </p>
            <p>Zgłoszenie powinno zawierać dane Klienta i opis problemu.</p>
            <p>Sprzedawca rozpatrzy reklamację w terminie 14 dni.</p>

            <h3>§11 Ochrona danych osobowych</h3>
            <p>Administratorem danych osobowych jest Cezary Prusak.</p>
            <p>
              Dane przetwarzane są w celu realizacji zamówienia, prowadzenia
              konta oraz ewentualnego rozpatrywania reklamacji.
            </p>
            <p>
              Szczegółowe zasady przetwarzania danych oraz wykorzystania plików
              cookies opisane są w Polityce Prywatności, dostępnej pod adresem:
              https://fizykastatkiem.pl/polityka-prywatnosci.
            </p>

            <h3>§12 Postanowienia końcowe</h3>
            <p>
              W sprawach nieuregulowanych niniejszym Regulaminem mają
              zastosowanie przepisy prawa polskiego, w szczególności Kodeksu
              Cywilnego oraz Ustawy o prawach konsumenta.
            </p>
            <p>
              Sprzedawca zastrzega sobie prawo do zmiany Regulaminu. Do zamówień
              złożonych przed zmianą stosuje się wersję Regulaminu obowiązującą w
              chwili zakupu.
            </p>
            <p>
              Klient ma możliwość skorzystania z pozasądowych sposobów
              rozpatrywania reklamacji i dochodzenia roszczeń, w tym za
              pośrednictwem platformy ODR UE: http://ec.europa.eu/consumers/odr.
            </p>
            <p>Regulamin wchodzi w życie z dniem publikacji na stronie Sklepu.</p>
          </div>
        </Container>
      </section>
    </>
  );
}
