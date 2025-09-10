-- Najpierw dodaj UNIQUE constraint jeśli nie istnieje
ALTER TABLE enrollments ADD CONSTRAINT enrollments_user_course_unique 
UNIQUE (user_id, course_id);

-- Funkcja RPC do dodawania enrollment z uprawnieniami serwera
-- Ta funkcja omija RLS i pozwala backendowi na dodawanie enrollment

CREATE OR REPLACE FUNCTION add_enrollment_for_payment(
  p_user_id UUID,
  p_course_id INTEGER
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER -- Uruchamia funkcję z uprawnieniami właściciela (omija RLS)
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
  
  -- Konwertuj wynik na JSON
  SELECT row_to_json(result_record) INTO result_json;
  
  RETURN result_json;
EXCEPTION
  WHEN OTHERS THEN
    -- Zwróć błąd w formacie JSON
    RETURN json_build_object(
      'error', true,
      'message', SQLERRM,
      'code', SQLSTATE
    );
END;
$$;

-- Nadaj uprawnienia do wykonywania funkcji dla roli anon i authenticated
GRANT EXECUTE ON FUNCTION add_enrollment_for_payment(UUID, INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION add_enrollment_for_payment(UUID, INTEGER) TO authenticated;