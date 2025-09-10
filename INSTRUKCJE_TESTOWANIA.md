# Instrukcje testowania płatności

## ✅ Co zostało naprawione:

1. **Email w Stripe checkout** - teraz używa aktualnego emaila zalogowanego użytkownika
2. **Backend używa poprawnych kluczy** - naprawiono problem z uprawnieniami RLS
3. **Webhook pobiera line_items** - teraz poprawnie identyfikuje kupione kursy
4. **Funkcja RPC** - omija RLS i pozwala na dodawanie enrollment
5. **Testowy tryb** - można testować bez faktycznego płacenia

## 🧪 Jak przetestować system:

### 1. Wykonaj funkcję SQL w Supabase (WYMAGANE!)

Przejdź do **Supabase Dashboard** → **SQL Editor** i wykonaj:

```sql
-- Najpierw dodaj UNIQUE constraint jeśli nie istnieje
ALTER TABLE enrollments ADD CONSTRAINT enrollments_user_course_unique 
UNIQUE (user_id, course_id);

-- Funkcja RPC do dodawania enrollment z uprawnieniami serwera
CREATE OR REPLACE FUNCTION add_enrollment_for_payment(
  p_user_id UUID,
  p_course_id INTEGER
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result_record RECORD;
  result_json JSON;
  existing_record RECORD;
BEGIN
  -- Sprawdź czy enrollment już istnieje
  SELECT * INTO existing_record 
  FROM enrollments 
  WHERE user_id = p_user_id AND course_id = p_course_id;
  
  IF existing_record IS NOT NULL THEN
    -- Zaktualizuj istniejący rekord
    UPDATE enrollments 
    SET access_granted = true, enrolled_at = NOW()
    WHERE user_id = p_user_id AND course_id = p_course_id
    RETURNING * INTO result_record;
  ELSE
    -- Dodaj nowy rekord
    INSERT INTO enrollments (user_id, course_id, access_granted, enrolled_at)
    VALUES (p_user_id, p_course_id, true, NOW())
    RETURNING * INTO result_record;
  END IF;
  
  SELECT row_to_json(result_record) INTO result_json;
  RETURN result_json;
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'error', true,
      'message', SQLERRM,
      'code', SQLSTATE
    );
END;
$$;

GRANT EXECUTE ON FUNCTION add_enrollment_for_payment(UUID, INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION add_enrollment_for_payment(UUID, INTEGER) TO authenticated;
```

### 2. Test bez płacenia (TRYB TESTOWY)

1. **Zaloguj się** na stronie
2. **Przejdź do kursu** który nie masz
3. **Znajdź sekcję "🧪 Tryb testowy"** pod przyciskami kupna
4. **Kliknij "TEST: Kup ten kurs"** lub **"TEST: Kup wszystkie"**
5. **Sprawdź czy** dostałeś dostęp do kursu (odśwież stronę)

### 3. Test z faktyczną płatnością (Stripe)

1. **Zaloguj się** na stronie
2. **Kliknij "Kup ten kurs"** lub **"Kup wszystkie materiały"**
3. **Email w Stripe checkout** będzie automatycznie wypełniony twoim emailem
4. **Użyj testowej karty:** `4242 4242 4242 4242`, data: przyszła, CVC: 123
5. **Po płatności** zostaniesz przekierowany i dostaniesz dostęp

### 4. Sprawdzenie w bazie danych

W Supabase Dashboard → Table Editor → `enrollments` powinieneś zobaczyć:
- `user_id` - twój ID użytkownika
- `course_id` - ID kursu (1-16) lub wszystkie kursy dla full_access
- `access_granted` - `true`
- `enrolled_at` - data dodania

## 🔍 Logi debugowania

Backend loguje wszystkie operacje:
- Webhook events
- RPC calls
- Enrollment creation
- Błędy

Sprawdź logi w terminalu gdzie działa backend.

## ⚠️ Potencjalne problemy

1. **Funkcja RPC nie istnieje** → Wykonaj SQL z punktu 1
2. **Backend nie działa** → Uruchom `cd backend && node index.js`
3. **Brak dostępu po płatności** → Sprawdź logi backendu
4. **Błąd RLS** → Funkcja RPC powinna to omijać

## 🎯 Status

- ✅ Email w checkout session - NAPRAWIONE
- ✅ Backend z poprawnymi uprawnieniami - NAPRAWIONE  
- ✅ Webhook pobiera line_items - NAPRAWIONE
- ✅ RPC function omija RLS - DODANE
- ✅ Tryb testowy bez płacenia - DODANE
- ✅ Szczegółowe logowanie - DODANE

**System jest gotowy do testowania!** 🚀