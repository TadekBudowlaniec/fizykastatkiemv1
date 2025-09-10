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
BEGIN
  -- Dodaj lub zaktualizuj enrollment
  INSERT INTO enrollments (user_id, course_id, access_granted, enrolled_at)
  VALUES (p_user_id, p_course_id, true, NOW())
  ON CONFLICT (user_id, course_id) 
  DO UPDATE SET 
    access_granted = true,
    enrolled_at = NOW()
  RETURNING * INTO result_record;
  
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