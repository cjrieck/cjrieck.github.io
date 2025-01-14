import StickyHeader from "../../components/sticky-header/sticky-header";
import Header from "../../components/header/header";
import BrandsList from "../../components/brands-list/brands-list";
import FeatureSection from "../../components/feature-section/feature-section";
import technologyTranslucent from "../../img/feature-art/technology-translucent.png";
import phoneTranslucent from "../../img/feature-art/phone-translucent.png";
import messageBubblesTranslucent from "../../img/feature-art/message-bubble-translucent.png";
import Footer from "../../components/footer/footer";

export default function Home() {
  return (
    <div className="home">
      <StickyHeader />
      <Header />
      <BrandsList />
      <FeatureSection
        id={0}
        title={
          `Great Minds.
          Thinking Together.`
        }
        description="We will formulate, execute and deliver on a plan that you can confidently scale and maintain."
        artworkSource={technologyTranslucent}
        detailRoute={{buttonTitle: "See Process", routeName: "/expertise"}}
      />
      <FeatureSection
        id={1}
        title={
          `From 0 to 1 and 1 to Infinity`
        }
        description={
          `Shipping a product is easy, but knowing what to ship can be hard.
          I take a user-first approach to product development in order to deliver high-value and delightful solutions.`
        }
        artworkSource={phoneTranslucent}
        detailRoute={{buttonTitle: "See Work", routeName: "/projects"}}
      />
      <FeatureSection
        id={2}
        title="What Can You Expect?"
        description="I will bring my expertise in technology, product planning and leadership, but I’m not “just the consultant.” I will be a member of your team and organization and always act in your best interest."
        artworkSource={messageBubblesTranslucent}
      />
      <Footer />
    </div>
  )
}