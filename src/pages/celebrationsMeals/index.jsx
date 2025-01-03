import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Wrapper from "../../components/wrapper";
import MealServices from "../../components/mealServices";
import ProductCard from "../../components/celebrationProductCard";
import logowhite from '../../assets/logowhite.png'
import './styles.scss';

const CelebrationsMeals = () => {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if(!location?.state?.products?.length) {
            navigate('/celebrations');
        }
        // eslint-disable-next-line
    }, []);



    return (
        <Wrapper headertext="Add Meal to Your Celebration!" footer={true}>
            <section className="celebration-meal-section">
                <br />
                <h3 className="sectionTitle">Selected Products</h3>
                <section className="optionsContainerMeal">
                    {location?.state?.products.map((product) => 
                        <ProductCard
                            buttons={false}
                            product={product}
                            productAdded={() => {}}
                            selected={true}
                        />
                    )}
                </section>
                <MealServices title='Add Meal'/>
                <footer className="footer-next" onClick={() => {}}>
                    <img src={logowhite} alt="" />
                    <span>Get Pricing</span>
                </footer>
            </section>
        </Wrapper>
    );
};

export default CelebrationsMeals;
