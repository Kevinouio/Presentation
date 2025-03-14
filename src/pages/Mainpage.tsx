import { useEffect, useRef, useState } from "react";
import "../styles/Mainpage.css";

const Mainpage: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.3 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => {
            if (sectionRef.current) {
                observer.unobserve(sectionRef.current);
            }
        };
    }, []);

    return (
        <div className={`mainpage fade-in ${isVisible ? "show" : ""}`}>
            <header className="header-section">
                <h1 className="title">Alpha Zero on Connect 4</h1>

            </header>

            <section
                ref={sectionRef}
                className={`content-section`}
            >
                <h2>What is AlphaGo and AlphaZero?</h2>
                <ul>
                    <li>
                        A game-playing agent created by Google DeepMind that was trained using reinforcement learning to beat the best players in Go, Chess, Shogi, etc.
                        <ul>
                            <li>AlphaGo was the first iteration and played against human players.</li>
                            <li>AlphaGo Zero improved by removing human input and training solely through self-play.</li>
                            <li>AlphaZero generalized the approach to Chess, Shogi, and other games.</li>
                        </ul>
                    </li>
                    <li>In October 2015, AlphaGo beat Fan Hui, marking the first instance of a computer program defeating a professional player.</li>
                    <li>In March 2016, AlphaGo beat Lee Sedol, the second-best player in Go at the time.</li>
                    <li>AlphaGo Zero and AlphaZero are more generalized versions of AlphaGo, using only self-play to train themselves to a superhuman level.</li>
                </ul>
            </section>

            <section className="content-section">
                <h1>How is AlphaZero structured/trained?</h1>
                <ul>
                    <li>Deep Neural Network with 2 heads – policy and state value – based on the ResNet architecture</li>
                    <li>Initial 3x3 Convolution Layer with 256 filters</li>
                    <li>40 residual blocks, each composed of two 3x3 convolution layers with a skip connection, with 256 filters</li>
                </ul>
            </section>
        </div>
    );
};

export default Mainpage;
