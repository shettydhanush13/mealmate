import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Wrapper from "../../../components/wrapper";
import ProductCardMini from "../../../components/celebrationProductCard/mini.jsx";
import logowhite from '../../../assets/logowhite.png'
import Checkbox from '@mui/material/Checkbox';
import './styles.scss';

const CelebrationsMeals = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [needMeal, setNeedMeal] = useState(false);

    useEffect(() => {
        if (needMeal) {
            setTimeout(() => {
                navigate('/create-menu');
            }, 1000)
        }
        // eslint-disable-next-line
    }, [needMeal]);

    useEffect(() => {
        window.scrollTo(0, 0);
        if(!location?.state?.products?.length) {
            navigate('/celebrations');
        }
        localStorage.setItem(
            'celebration-services',
            JSON.stringify(location?.state?.products)
        );
        // eslint-disable-next-line
    }, []);

    const checkout = () => {
        navigate('/celebrations/checkout', { state : { products : location?.state?.products }})
    }

    return (
        <Wrapper headertext="Add Meal to Your Celebration!" footer={true}>
            <section className="celebration-meal-section">
                <br />
                <h3 className="sectionTitle">Selected Services</h3>
                <section className="optionsContainerMeal">
                    {location?.state?.products.map((product) => 
                        <ProductCardMini product={product}/>
                    )}
                </section>
                
                <section className='addMealSection'>
                    <img src="https://www.shutterstock.com/image-vector/hotel-buffet-dining-table-smorgasbord-600nw-2418740701.jpg" alt="" />
                    <section className="needMealSection">
                        <Checkbox checked={needMeal} onChange={() => setNeedMeal((checked) => !checked)}/>
                        <p className="key">Add Meal to My Celebration.</p>
                    </section>
                </section>
                <footer className="footer-next" onClick={() => checkout()}>
                    <img src={logowhite} alt="" />
                    <span>Checkout</span>
                </footer>
            </section>
        </Wrapper>
    );
};

export default CelebrationsMeals;
