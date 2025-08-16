import { useId, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage, useFormikContext } from "formik";
import type { FormikHelpers } from "formik";
import * as Yup from "yup";
import css from "./OrderForm.module.css";

// ✅ Категорії товарів з цінами за кг
const categoryPrices: Record<string, number> = {
  "Amazon cat A": 20,
  "Amazon cat B": 25,
  "Aliexpress": 35,
  "Temu": 50,
};

// ✅ Валідація форми
const OrderSchema = Yup.object().shape({
  username: Yup.string().min(2, "Too Short!").required("Required"),
  tel: Yup.string().min(5, "Too Short!").required("Required"),
  email: Yup.string().email("Invalid email").required("Required"),
  delivery: Yup.string().oneOf(["pickup", "courier", "drone"]).required("Required"),
  restrictions: Yup.array().of(Yup.string().oneOf(["vegan", "gluten-free", "nut-free"])),
  deliveryTime: Yup.string().required("Required"),
  message: Yup.string().max(200, "Too long!"),
  weight: Yup.number().min(0.1, "Min 0.1kg").required("Required"),
  pricePerKg: Yup.number().min(0.1, "Min 0.1 zł").required("Required"),
  category: Yup.string().required("Required"),
});

// ✅ Типи форми
interface FormValues {
  username: string;
  tel: string;
  email: string;
  delivery: "pickup" | "courier" | "drone";
  restrictions: ("vegan" | "gluten-free" | "nut-free")[];
  deliveryTime: string;
  message: string;
  weight: number;
  pricePerKg: number;
  category: string;
}

// ✅ Початкові значення
const initialFormValues: FormValues = {
  username: "Руслан",
  tel: "232342432424",
  email: "youremail@mail.com",
  delivery: "pickup",
  restrictions: [],
  deliveryTime: "afternoon",
  message: "",
  weight: 1,
  pricePerKg: 0,
  category: "",
};

// ✅ Функція обчислення ціни
function calculatePrice(weight: number, pricePerKg: number) {
  return (weight * pricePerKg).toFixed(2);
}

// ✅ Компонент для калькуляції ціни
function PriceCalculator() {
  const { values, setFieldValue } = useFormikContext<FormValues>();

  useEffect(() => {
    if (values.category) {
      setFieldValue("pricePerKg", categoryPrices[values.category]);
    } else {
      setFieldValue("pricePerKg", 0);
    }
  }, [values.category, setFieldValue]);

  return (
    <>
      <p className={css.result}>
        Ціна за 1кг: <strong>{values.pricePerKg} zł</strong>
      </p>
      <p className={css.result}>
        Загальна вартість: <strong>{calculatePrice(values.weight, values.pricePerKg)} zł</strong>
      </p>
    </>
  );
}

// ✅ Головна форма
export default function OrderForm() {
  const fieldId = useId();

  const handleSubmit = async (values: FormValues, formikHelpers: FormikHelpers<FormValues>) => {
    console.log({
      ...values,
      totalPrice: calculatePrice(values.weight, values.pricePerKg),
    });
    formikHelpers.resetForm();
  };

  return (
    <Formik initialValues={initialFormValues} validationSchema={OrderSchema} onSubmit={handleSubmit}>
      {() => (
        <Form className={css.form}>
          {/* --- Дані покупця --- */}
          <fieldset className={css.fieldset}>
            <legend className={css.legend}>Дані покупця</legend>
            <label htmlFor={`${fieldId}-username`} className={css.label}>Ім'я</label>
            <Field type="text" name="username" id={`${fieldId}-username`} className={css.input} />
            <ErrorMessage name="username" component="span" className={css.error} />

            <label htmlFor={`${fieldId}-tel`} className={css.label}>Телефон</label>
            <Field type="text" name="tel" id={`${fieldId}-tel`} className={css.input} />
            <ErrorMessage name="tel" component="span" className={css.error} />

            <label htmlFor={`${fieldId}-email`} className={css.label}>Електронна пошта</label>
            <Field type="email" name="email" id={`${fieldId}-email`} className={css.input} />
            <ErrorMessage name="email" component="span" className={css.error} />
          </fieldset>

          {/* --- Калькуляція замовлення --- */}
          <fieldset className={css.fieldset}>
            <legend className={css.legend}>Калькуляція замовлення</legend>
            <label htmlFor={`${fieldId}-weight`} className={css.label}>Вага (кг)</label>
            <Field type="number" name="weight" id={`${fieldId}-weight`} className={css.input} step="0.1" min="0.1" />
            <ErrorMessage name="weight" component="span" className={css.error} />

            <label htmlFor={`${fieldId}-category`} className={css.label}>Категорія товарів</label>
            <Field as="select" name="category" id={`${fieldId}-category`} className={css.input}>
              <option value="">Виберіть категорію</option>
              {Object.keys(categoryPrices).map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </Field>
            <ErrorMessage name="category" component="span" className={css.error} />

            <PriceCalculator />
          </fieldset>

          {/* --- Доставка --- */}
          <fieldset className={css.fieldset}>
            <legend className={css.legend}>Метод доставки</legend>
            <label className={css.option}><Field type="radio" name="delivery" value="pickup" /> Нова Пошта</label>
            <label className={css.option}><Field type="radio" name="delivery" value="courier" /> DHL</label>
            <label className={css.option}><Field type="radio" name="delivery" value="drone" /> Poszta Polska</label>
            <ErrorMessage name="delivery" component="span" className={css.error} />
          </fieldset>

          {/* --- Час доставки --- */}
          <label htmlFor={`${fieldId}-deliveryTime`} className={css.label}>Очікуваний час доставки</label>
          <Field as="select" name="deliveryTime" id={`${fieldId}-deliveryTime`} className={css.input}>
            <option value="">-- Виберіть час доставки --</option>
            <option value="morning">Ранок (8:00-12:00)</option>
            <option value="afternoon">Обід (12:00-16:00)</option>
            <option value="evening">Вечір (16:00-20:00)</option>
          </Field>
          <ErrorMessage name="deliveryTime" component="span" className={css.error} />

          {/* --- Коментар --- */}
          <label htmlFor={`${fieldId}-message`} className={css.label}>Коментар</label>
          <Field as="textarea" name="message" rows={4} id={`${fieldId}-message`} className={css.textarea} />
          <ErrorMessage name="message" component="span" className={css.error} />

          {/* --- Надіслати --- */}
          <button type="submit" className={css.button}>
            Надіслати
          </button>
        </Form>
      )}
    </Formik>
  );
}
